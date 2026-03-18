import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitGameScore } from '../utils/api';
import type { Answer, ReviewItem } from '../types';

export default function Result() {
  const navigate = useNavigate();
  const [score, setScore] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<ReviewItem[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const threshold = Number(import.meta.env.VITE_PASS_THRESHOLD || 60);
  const isSubmitting = useRef(false);

  useEffect(() => {
    const userId = localStorage.getItem('quiz_user_id');
    const answersStr = localStorage.getItem('quiz_answers');
    
    if (!userId || !answersStr) {
      navigate('/');
      return;
    }

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    const answers: Answer[] = JSON.parse(answersStr);

    const submitData = async () => {
      try {
        const data = await submitGameScore(userId, answers, threshold);
        setScore(data.score);
        setReviewData(data.review || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    submitData();
  }, [navigate, threshold]);

  if (loading) return <div className="loading">CALCULATING SCORE...</div>;
  if (error) return <div className="pixel-box" style={{color: 'var(--primary-color)'}}>ERROR: {error}</div>;

  const isPass = score !== null && score >= threshold;

  return (
    <div className="game-container pixel-box" style={{ textAlign: 'center' }}>
      <h1 className="title">{isPass ? 'STAGE CLEAR!' : 'GAME OVER'}</h1>
      <h2>YOUR SCORE: {score}</h2>
      <p style={{ margin: '20px 0', color: isPass ? 'var(--secondary-color)' : 'var(--text-color)' }}>
        {isPass ? 'Congratulations! You beat the bosses!' : `You need ${threshold} points to pass.`}
      </p>
      
      <button className="pixel-btn" onClick={() => navigate('/')}>PLAY AGAIN</button>
      
      {reviewData.length > 0 && (
        <button className="pixel-btn" onClick={() => setShowReview(!showReview)} style={{ marginTop: '10px', background: 'transparent' }}>
          {showReview ? 'HIDE REVIEW' : 'REVIEW ANSWERS'}
        </button>
      )}

      {showReview && (
        <div style={{ marginTop: '30px', textAlign: 'left', fontSize: '12px' }}>
          {reviewData.map((item, idx) => (
            <div key={idx} className="pixel-box" style={{ borderColor: item.isCorrect ? 'var(--secondary-color)' : 'var(--primary-color)', marginBottom: '15px', padding: '15px' }}>
              <p style={{ lineHeight: '1.5' }}>Q{idx + 1}: {item.questionText}</p>
              <p style={{ color: item.isCorrect ? 'var(--secondary-color)' : 'var(--primary-color)', marginTop: '10px', lineHeight: '1.5' }}>
                Your Answer: {item.chosen} - {item.options[item.chosen as keyof typeof item.options]}
                {!item.isCorrect ? ' ❌' : ' ✅'}
              </p>
              {!item.isCorrect && (
                <p style={{ color: 'var(--secondary-color)', marginTop: '5px', lineHeight: '1.5' }}>
                  Correct Answer: {item.correct} - {item.options[item.correct as keyof typeof item.options]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
