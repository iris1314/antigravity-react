export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface Answer {
  questionId: string;
  chosen: string;
}

export interface ReviewItem {
  questionId: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  chosen: string;
  correct: string;
  isCorrect: boolean;
}
