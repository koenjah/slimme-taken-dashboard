import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import TaskCard from "./TaskList/TaskCard";
import { fetchArchivedTasks, updateTask, updateSubtask } from "./TaskList/mutations";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const ArchivedTaskList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'task' | 'subtask' } | null>(null);

  const { data: archivedTasks, isLoading } = useQuery({
    queryKey: ['archivedTasks'],
    queryFn: fetchArchivedTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archivedTasks'] });
      toast({
        title: "Taak bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: updateSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archivedTasks'] });
      toast({
        title: "Subtaak bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
  });

  const permanentlyDeleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: number) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivedTasks'] });
      toast({
        title: "Subtaak verwijderd",
        description: "De subtaak is permanent verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de subtaak.",
        variant: "destructive",
      });
    },
  });

  const permanentlyDeleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archivedTasks'] });
      toast({
        title: "Taak verwijderd",
        description: "De taak en bijbehorende subtaken zijn permanent verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de taak.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'task') {
      permanentlyDeleteTaskMutation.mutate(itemToDelete.id);
    } else {
      permanentlyDeleteSubtaskMutation.mutate(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (isLoading) return <div className="animate-pulse">Archief Laden...</div>;

  // Filter tasks to only include those with completed subtasks
  const tasksWithCompletedSubtasks = archivedTasks?.filter(task => 
    task.subtasks?.some(subtask => subtask.completed)
  ).map(task => ({
    ...task,
    subtasks: task.subtasks?.filter(subtask => subtask.completed)
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-6">Archief</h2>
      <div className="space-y-4">
        {tasksWithCompletedSubtasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskEdit={(task) => {
              updateTaskMutation.mutate({
                ...task,
                archived: task.completed || task.progress === 100,
              });
            }}
            onSubtaskUpdate={(subtask) => {
              updateSubtaskMutation.mutate({
                ...subtask,
                archived: subtask.completed || subtask.progress === 100,
              });
            }}
            onSubtaskDelete={(subtaskId) => {
              setItemToDelete({ id: subtaskId, type: 'subtask' });
              setDeleteDialogOpen(true);
            }}
            onTaskDelete={(taskId) => {
              setItemToDelete({ id: taskId, type: 'task' });
              setDeleteDialogOpen(true);
            }}
          />
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Weet je zeker dat je dit {itemToDelete?.type === 'task' ? 'deze taak' : 'deze subtaak'} permanent wilt verwijderen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt.
              {itemToDelete?.type === 'task' && ' Alle bijbehorende subtaken worden ook verwijderd.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchivedTaskList;