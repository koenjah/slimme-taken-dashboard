import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (*)
    `)
    .order('priority_score', { ascending: false });

  if (error) throw error;
  return data || [];
};

type CreateTaskInput = {
  name: string;
  description?: string;
  icon?: string;
  priority_score?: number;
  progress?: number;
  completed?: boolean;
  due_date?: string | null;
};

export const createTask = async (task: CreateTaskInput) => {
  const { error } = await supabase
    .from('tasks')
    .insert([{
      name: task.name,
      description: task.description || '',
      icon: task.icon || 'zap',
      priority_score: task.priority_score || 1,
      progress: task.progress || 0,
      completed: task.completed || false,
      due_date: task.due_date || null
    }]);
  if (error) throw error;
};

export const updateTask = async (task: { id: number } & Partial<Omit<Task, 'subtasks' | 'created_at'>>) => {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id);
  if (error) throw error;
};