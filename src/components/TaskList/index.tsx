import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskForm from "../TaskForm";
import TaskCard from "./TaskCard";
import { fetchTasks, updateTask, createTask } from "./TaskListMutations";

const TaskList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    mutationFn: createTask,
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

    // Update priority scores
    const updates = newTasks.map((task, index) => ({
      id: task.id,
      priority_score: newTasks.length - index,
    }));

    for (const update of updates) {
      await updateTaskMutation.mutateAsync(update);
    }
  };

  if (isLoading) return <div className="animate-pulse font-inter">Taken Laden...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold font-poppins text-[#154273]">Taken</h2>
        <Button onClick={() => setIsAddingTask(true)} className="bg-[#154273] hover:bg-[#154273]/90">
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
                      {...provided.dragHandleProps}
                      className="mb-4"
                    >
                      <TaskCard
                        task={task}
                        onTaskEdit={setEditingTask}
                        onSubtaskUpdate={updateTaskMutation.mutate}
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

      <TaskForm
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
        onSubmit={(task) => createTaskMutation.mutate({ name: task.name || '', description: task.description, icon: task.icon })}
      />

      <TaskForm
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={(task) => {
          if (editingTask) {
            updateTaskMutation.mutate({ ...task, id: editingTask.id });
          }
        }}
      />
    </div>
  );
};

export default TaskList;