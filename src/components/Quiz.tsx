import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../utils/api';
import { getBossImageUrl, getRandomBossSeed } from '../utils/dicebear';
import type { Question, Answer } from '../types';

export default function Quiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bossImage, setBossImage] = useState('');

  const count = Number(import.meta.env.VITE_QUESTION_COUNT || 10);

  useEffect(() => {
    const userId = localStorage.getItem('quiz_user_id');
    if (!userId) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchQuestions(count);
        setQuestions(data);
        generateNewBoss();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate, count]);

  const generateNewBoss = () => {
    setBossImage(getBossImageUrl(getRandomBossSeed()));
  };

  const handleAnswer = (chosenOption: string) => {
    const currentQ = questions[currentIndex];
    const newAnswers = [...answers, { questionId: currentQ.id, chosen: chosenOption }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      generateNewBoss();
    } else {
      localStorage.setItem('quiz_answers', JSON.stringify(newAnswers));
      navigate('/result');
    }
  };

  if (loading) return <div className="loading">LOADING STAGE...</div>;
  if (error) return <div className="pixel-box" style={{color: 'var(--primary-color)'}}>ERROR: {error}</div>;
  if (questions.length === 0) return <div>No Questions Found</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="game-container pixel-box">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span>STAGE {currentIndex + 1}/{questions.length}</span>
        <span>ID: {localStorage.getItem('quiz_user_id')}</span>
      </div>

      <img src={bossImage} alt="Boss" className="boss-image" />
      
      <div style={{ marginBottom: '30px', lineHeight: '1.5' }}>
        <p>{currentQ.question}</p>
      </div>

      <div className="option-grid">
        {(Object.entries(currentQ.options) as [string, string][]).map(([key, text]) => (
          <button 
            key={key} 
            className="pixel-btn" 
            onClick={() => handleAnswer(key)}
          >
            {key}. {text}
          </button>
        ))}
      </div>
    </div>
  );
}
