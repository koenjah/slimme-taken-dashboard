import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('priority_score', { ascending: false });

  if (tasksError) throw tasksError;

  // Fetch subtasks for each task
  const tasksWithSubtasks = await Promise.all(
    (tasks || []).map(async (task) => {
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', task.id)
        .eq('archived', false)
        .order('priority_score', { ascending: false });

      if (subtasksError) throw subtasksError;

      return {
        ...task,
        subtasks: subtasks || [],
      };
    })
  );

  return tasksWithSubtasks;
};

export const updateTask = async (task: Partial<Task> & { id: number }): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id);
  
  if (error) throw error;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
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
    .select()
    .single();

  if (error) throw error;
  return { ...data, subtasks: [] };
};