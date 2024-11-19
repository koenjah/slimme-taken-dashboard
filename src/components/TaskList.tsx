import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useState } from "react";
import { Plus } from "lucide-react";
import TaskCard from "./TaskList/TaskCard";
import { fetchTasks, updateTask, createTask } from "./TaskList/mutations";

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
      toast({
        title: "Taak bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      if (!taskData.name) {
        throw new Error('Task name is required');
      }
      return createTask({
        name: taskData.name,
        description: taskData.description,
        icon: taskData.icon,
        priority_score: taskData.priority_score,
        progress: taskData.progress,
        completed: taskData.completed,
        due_date: taskData.due_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Taak toegevoegd",
        description: "De nieuwe taak is succesvol aangemaakt.",
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
                        onTaskEdit={(updatedTask) => {
                          updateTaskMutation.mutate({
                            id: task.id,
                            ...updatedTask
                          });
                        }}
                        onSubtaskUpdate={updateTaskMutation.mutate}
                        onSubtaskDelete={(subtaskId) => {
                          updateTaskMutation.mutate({
                            id: subtaskId,
                            completed: true,
                            progress: 100
                          });
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