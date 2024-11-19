import { Task, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('archived', false)
    .order('priority_score', { ascending: false });

  if (tasksError) throw tasksError;

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

export const fetchArchivedTasks = async (): Promise<Task[]> => {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('archived', true)
    .order('created_at', { ascending: false });

  if (tasksError) throw tasksError;

  const tasksWithSubtasks = await Promise.all(
    (tasks || []).map(async (task) => {
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', task.id)
        .eq('archived', true)
        .order('created_at', { ascending: false });

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
  const { subtasks, ...taskUpdate } = task;
  
  const { error } = await supabase
    .from('tasks')
    .update(taskUpdate)
    .eq('id', task.id);
  
  if (error) throw error;
};

export const updateSubtask = async (subtask: Partial<Subtask> & { id: number }): Promise<void> => {
  const { error } = await supabase
    .from('subtasks')
    .update(subtask)
    .eq('id', subtask.id);
  
  if (error) throw error;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const { subtasks, ...taskCreateData } = taskData;
  
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
  return { ...data, subtasks: [] };
};