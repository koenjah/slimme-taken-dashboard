import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Plus } from "lucide-react";
import TaskCard from "./TaskList/TaskCard";
import { fetchTasks, updateTask, createTask, updateSubtask } from "./TaskList/mutations";
import { supabase } from "@/integrations/supabase/client";

const TaskList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
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

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Taak toegevoegd",
        description: "De nieuwe taak is succesvol aangemaakt.",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      // First delete all subtasks
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      // Then delete the task
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Taak verwijderd",
        description: "De taak en bijbehorende subtaken zijn succesvol verwijderd.",
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

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: number) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Subtaak verwijderd",
        description: "De subtaak is succesvol verwijderd.",
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

  const handleTaskDragEnd = async (result: any) => {
    if (!result.destination || !tasks) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(destIndex, 0, removed);

    const updates = newTasks.map((task, index) => ({
      id: task.id,
      priority_score: newTasks.length - index,
    }));

    for (const update of updates) {
      await updateTaskMutation.mutateAsync(update);
    }
  };

  const handleTaskUpdate = (task: Task) => {
    updateTaskMutation.mutate({
      ...task,
      archived: task.completed || task.progress === 100,
    });
  };

  const handleSubtaskUpdate = (subtask: { id: number } & Partial<Task>) => {
    updateSubtaskMutation.mutate({
      ...subtask,
      archived: subtask.completed || subtask.progress === 100,
    });
  };

  if (isLoading) return <div className="animate-pulse">Taken Laden...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Taken</h2>
        <Button onClick={() => {
          createTaskMutation.mutate({
            name: "Nieuwe taak",
            priority_score: tasks?.length ? tasks.length + 1 : 1,
            progress: 0,
            completed: false,
          });
        }} className="bg-[#154273] hover:bg-[#154273]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Taak
        </Button>
      </div>

      <DragDropContext onDragEnd={handleTaskDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tasks?.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4"
                    >
                      <TaskCard
                        task={task}
                        dragHandleProps={provided.dragHandleProps}
                        onTaskEdit={handleTaskUpdate}
                        onSubtaskUpdate={handleSubtaskUpdate}
                        onSubtaskDelete={(subtaskId) => {
                          deleteSubtaskMutation.mutate(subtaskId);
                        }}
                        onTaskDelete={(taskId) => {
                          deleteTaskMutation.mutate(taskId);
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TaskList;