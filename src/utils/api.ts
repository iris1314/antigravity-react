import type { Answer, Question, ReviewItem } from '../types';

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

export const fetchQuestions = async (count: number): Promise<Question[]> => {
  if (!GAS_URL) throw new Error('VITE_GOOGLE_APP_SCRIPT_URL is not set!');
  
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getQuestions', count }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch questions');
  return data.questions;
};

export const submitGameScore = async (id: string, answers: Answer[], passThreshold: number): Promise<{score: number, review: ReviewItem[]}> => {
  if (!GAS_URL) throw new Error('VITE_GOOGLE_APP_SCRIPT_URL is not set!');
  
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'submitScore', id, answers, passThreshold }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Failed to submit score');
  return { score: data.score, review: data.review };
};
