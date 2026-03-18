import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preloadBossImages } from '../utils/dicebear';

export default function Home() {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    preloadBossImages();
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    localStorage.setItem('quiz_user_id', userId.trim());
    navigate('/quiz');
  };

  return (
    <div className="game-container pixel-box">
      <h1 className="title">Arcade Quiz Boss</h1>
      <form onSubmit={handleStart} style={{ textAlign: 'center' }}>
        <p>INSERT COIN (Enter your ID)</p>
        <input 
          type="text" 
          className="pixel-input" 
          placeholder="Player ID" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required 
          autoFocus
        />
        <button type="submit" className="pixel-btn">START GAME</button>
      </form>
    </div>
  );
}
