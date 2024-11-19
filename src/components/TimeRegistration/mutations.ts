import { TimeEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const fetchTimeEntries = async (): Promise<TimeEntry[]> => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      tasks (name),
      subtasks (name)
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteTimeEntry = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};