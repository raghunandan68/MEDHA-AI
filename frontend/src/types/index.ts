export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface FlashCard {
  id: string;
  document_id: string;
  front: string;
  back: string;
  topic: string;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  status: "processing" | "ready" | "error";
  created_at: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  topic: string;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  document_id: string;
  score: number;
  total: number;
  answers: number[];
  completed_at: string;
}

export interface QuizResult {
  attempt: QuizAttempt;
  document_name: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
