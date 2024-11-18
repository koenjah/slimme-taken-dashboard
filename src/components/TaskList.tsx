import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, Settings, Zap, MoreVertical, Trash2, Edit3, GripVertical, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useState } from "react";
import TaskForm from "./TaskForm";

const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      subtasks (*)
    `)
    .order('priority_score', { ascending: false });

  if (error) throw error;
  return data || [];
};

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
    mutationFn: async (task: Partial<Task>) => {
      const { error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Taak bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { error } = await supabase
        .from('tasks')
        .insert([task]);
      if (error) throw error;
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
    const taskId = parseInt(result.draggableId);

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

  const handleSubtaskDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const [taskId, subtaskId] = result.draggableId.split('-').map(Number);

    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;

    const newSubtasks = Array.from(task.subtasks);
    const [removed] = newSubtasks.splice(sourceIndex, 1);
    newSubtasks.splice(destIndex, 0, removed);

    // Update priority scores
    const updates = newSubtasks.map((subtask, index) => ({
      id: subtask.id,
      priority_score: newSubtasks.length - index,
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
        <Button onClick={() => setIsAddingTask(true)} className="bg-primary hover:bg-primary/90">
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
                      <Card className="w-full animate-fade-in border-l-4 border-l-primary bg-white/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center space-x-4">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-primary">
                            {getIcon(task.icon)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-primary">
                              {task.name}
                            </CardTitle>
                            <p className="text-sm text-gray-500">{task.description}</p>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {task.progress}%
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Bewerken
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <Progress 
                              value={task.progress} 
                              className="h-2 bg-gray-100"
                            />
                          </div>
                          <DragDropContext onDragEnd={handleSubtaskDragEnd}>
                            <Droppable droppableId={`task-${task.id}`}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-3"
                                >
                                  {task.subtasks
                                    .filter(subtask => !subtask.archived)
                                    .map((subtask, index) => (
                                      <Draggable
                                        key={subtask.id}
                                        draggableId={`${task.id}-${subtask.id}`}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100"
                                          >
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Checkbox 
                                              checked={subtask.completed}
                                              onCheckedChange={(checked) => {
                                                updateTaskMutation.mutate({
                                                  id: subtask.id,
                                                  completed: checked as boolean,
                                                  progress: checked ? 100 : 0,
                                                });
                                              }}
                                              className="data-[state=checked]:bg-primary"
                                            />
                                            <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
                                              {subtask.name}
                                            </span>
                                            <Input
                                              type="number"
                                              value={subtask.progress}
                                              onChange={(e) => {
                                                const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                updateTaskMutation.mutate({
                                                  id: subtask.id,
                                                  progress,
                                                  completed: progress === 100,
                                                });
                                              }}
                                              className="w-20 text-right"
                                              min="0"
                                              max="100"
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
                        </CardContent>
                      </Card>
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
        onSubmit={(task) => createTaskMutation.mutate(task)}
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

const getIcon = (iconName: string | null) => {
  switch (iconName) {
    case "penTool":
      return <PenTool className="h-5 w-5" />;
    case "settings":
      return <Settings className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

export default TaskList;