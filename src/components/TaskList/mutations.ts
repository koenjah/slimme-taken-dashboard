import { Task, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (
        *,
        notes (*)
      ),
      notes (*)
    `)
    .eq('archived', false)
    .order('priority_score', { ascending: true });

  if (tasksError) throw tasksError;
  return tasks || [];
};

export const updateTask = async (task: Partial<Task> & { id: number }): Promise<void> => {
  const { subtasks, notes, ...taskUpdate } = task;
  
  const { error } = await supabase
    .from('tasks')
    .update(taskUpdate)
    .eq('id', task.id);
  
  if (error) throw error;
};

export const updateSubtask = async (subtask: Partial<Subtask> & { id: number }): Promise<void> => {
  const { notes, ...subtaskUpdate } = subtask;
  
  const { error } = await supabase
    .from('subtasks')
    .update(subtaskUpdate)
    .eq('id', subtask.id);
  
  if (error) throw error;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const { subtasks, notes, ...taskCreateData } = taskData;
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      name: taskCreateData.name,
      description: taskCreateData.description || '',
      icon: taskCreateData.icon || 'zap',
      priority_score: taskCreateData.priority_score || 0,
      progress: taskCreateData.progress || 0,
      completed: taskCreateData.completed || false,
      due_date: taskCreateData.due_date || null,
      archived: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return { ...data, subtasks: [], notes: [] };
};