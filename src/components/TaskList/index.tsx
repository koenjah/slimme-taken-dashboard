import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useState } from "react";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import { fetchTasks, updateTask, createTask } from "./mutations";

const TaskList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
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
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Taak toegevoegd",
        description: "De nieuwe taak is succesvol aangemaakt.",
      });
      setIsAddingTask(false);
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
        <h2 className="text-2xl font-title font-semibold text-[#154273]">Taken</h2>
        <Button 
          onClick={() => {
            createTaskMutation.mutate({
              name: "Nieuwe taak",
              description: "",
              priority_score: tasks.length + 1,
              progress: 0,
              completed: false,
            });
          }} 
          className="bg-[#154273] hover:bg-[#154273]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Taak
        </Button>
      </div>

      <DragDropContext onDragEnd={handleTaskDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => (
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
                        onTaskEdit={updateTaskMutation.mutate}
                        onSubtaskUpdate={updateTaskMutation.mutate}
                        onSubtaskDelete={(subtaskId) => {
                          // Handle subtask deletion
                          updateTaskMutation.mutate({
                            id: subtaskId,
                            archived: true
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