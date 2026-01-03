
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isAiGenerated?: boolean;
}

export interface DayData {
  date: string; // ISO string format YYYY-MM-DD
  todos: Todo[];
}

export interface ZhugeLiangAdvice {
  todo: string;
  caution: string;
  motivation: string;
}

export interface BookPlan {
  [date: string]: string; // Mapping date to the writing task
}
