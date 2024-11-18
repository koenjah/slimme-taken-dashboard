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

export const updateTask = async (task: { id: number } & Partial<Omit<Task, 'id'>>) => {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id);
  if (error) throw error;
};

export const createTask = async (task: { name: string; description?: string; icon?: string }) => {
  const { error } = await supabase
    .from('tasks')
    .insert([task]);
  if (error) throw error;
};