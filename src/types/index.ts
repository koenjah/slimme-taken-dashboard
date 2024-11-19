export interface Task {
  id: number;
  name: string;
  description: string;
  priority_score: number;
  completed: boolean;
  progress: number;
  icon: string | null;
  due_date: string | null;
  created_at: string;
  archived: boolean;
  subtasks: Subtask[];
}

export interface Subtask {
  id: number;
  task_id: number;
  name: string;
  description: string;
  priority_score: number;
  completed: boolean;
  progress: number;
  due_date: string | null;
  archived: boolean;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  task_id: number | null;
  subtask_id: number | null;
  hours: number;
  date: string;
  description: string;
  created_at: string;
  tasks?: { name: string };
  subtasks?: { name: string };
}