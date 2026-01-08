
export type QualityScore = 'Perfect' | 'Good' | 'Fair' | 'Needs Work';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  quality: QualityScore;
  dueDate: string | null;
  reminderSent: boolean;
  alarmEnabled: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string; // AI generated summary
  createdAt: number;
  tags: string[];
  color: string;
}

export interface AppState {
  notes: Note[];
  todos: Todo[];
  activeView: 'notes' | 'todos' | 'insights';
}
