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

// Ensure name is required for task creation
export const createTask = async (task: { name: string } & Partial<Task>) => {
  const { error } = await supabase
    .from('tasks')
    .insert([task]);
  if (error) throw error;
};

// For updates, we don't need name to be required
export const updateTask = async (task: { id: number } & Partial<Task>) => {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id);
  if (error) throw error;
};