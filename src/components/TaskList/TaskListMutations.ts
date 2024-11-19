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

export const updateTask = async (task: { id: number } & Partial<Task>): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id);
  if (error) throw error;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  if (!taskData.name) {
    throw new Error('Task name is required');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      name: taskData.name,
      description: taskData.description || '',
      icon: taskData.icon || 'zap',
      priority_score: taskData.priority_score || 0,
      progress: taskData.progress || 0,
      completed: taskData.completed || false,
      due_date: taskData.due_date || null,
    }])
    .select(`
      *,
      subtasks (*)
    `)
    .single();

  if (error) throw error;
  return data;
};