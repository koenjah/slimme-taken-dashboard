import { Task, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('archived', false)
    .order('priority_score', { ascending: true });

  if (tasksError) throw tasksError;

  const tasksWithSubtasksAndNotes = await Promise.all(
    (tasks || []).map(async (task) => {
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', task.id)
        .eq('archived', false)
        .order('priority_score', { ascending: true });

      if (subtasksError) throw subtasksError;

      const { data: taskNotes, error: taskNotesError } = await supabase
        .from('notes')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (taskNotesError) throw taskNotesError;

      const subtasksWithNotes = await Promise.all(
        (subtasks || []).map(async (subtask) => {
          const { data: subtaskNotes, error: subtaskNotesError } = await supabase
            .from('notes')
            .select('*')
            .eq('subtask_id', subtask.id)
            .order('created_at', { ascending: false });

          if (subtaskNotesError) throw subtaskNotesError;

          return {
            ...subtask,
            notes: subtaskNotes || [],
          };
        })
      );

      return {
        ...task,
        subtasks: subtasksWithNotes,
        notes: taskNotes || [],
      };
    })
  );

  return tasksWithSubtasksAndNotes;
};

export const fetchArchivedTasks = async (): Promise<Task[]> => {
  const { data: allTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (tasksError) throw tasksError;

  const tasksWithSubtasksAndNotes = await Promise.all(
    (allTasks || []).map(async (task) => {
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', task.id)
        .order('priority_score', { ascending: true });

      if (subtasksError) throw subtasksError;

      const { data: taskNotes, error: taskNotesError } = await supabase
        .from('notes')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (taskNotesError) throw taskNotesError;

      const subtasksWithNotes = await Promise.all(
        (subtasks || []).map(async (subtask) => {
          const { data: subtaskNotes, error: subtaskNotesError } = await supabase
            .from('notes')
            .select('*')
            .eq('subtask_id', subtask.id)
            .order('created_at', { ascending: false });

          if (subtaskNotesError) throw subtaskNotesError;

          return {
            ...subtask,
            notes: subtaskNotes || [],
          };
        })
      );

      return {
        ...task,
        subtasks: subtasksWithNotes,
        notes: taskNotes || [],
      };
    })
  );

  return tasksWithSubtasksAndNotes.filter(task => 
    task.archived || (task.subtasks && task.subtasks.some(subtask => subtask.archived))
  );
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