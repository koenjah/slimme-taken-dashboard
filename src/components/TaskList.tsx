import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, Settings, Zap, MoreVertical, Trash2, Edit3, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

  const { data: tasks, isLoading, error } = useQuery({
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

  const updateSubtaskMutation = useMutation({
    mutationFn: async (subtask: Partial<Subtask>) => {
      const { error } = await supabase
        .from('subtasks')
        .update(subtask)
        .eq('id', subtask.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Subtaak bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
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
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const taskId = parseInt(result.draggableId.split('-')[0]);
    const subtaskId = parseInt(result.draggableId.split('-')[1]);

    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;

    const newSubtasks = Array.from(task.subtasks);
    const [removed] = newSubtasks.splice(sourceIndex, 1);
    newSubtasks.splice(destIndex, 0, removed);

    // Update priority scores based on new order
    const updates = newSubtasks.map((subtask, index) => ({
      id: subtask.id,
      priority_score: newSubtasks.length - index,
    }));

    for (const update of updates) {
      await updateSubtaskMutation.mutateAsync(update);
    }
  };

  if (isLoading) return <div className="animate-pulse">Taken Laden...</div>;
  if (error) {
    toast({
      variant: "destructive",
      title: "Er is een fout opgetreden",
      description: "Kon de taken niet laden. Probeer het later opnieuw.",
    });
    return null;
  }

  const getProgressColor = (progress: number) => {
    if (progress < 34) return "bg-[#E63946]";
    if (progress < 67) return "bg-[#F4A261]";
    return "bg-[#2A9D8F]";
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

  return (
    <div className="space-y-6">
      {tasks?.map((task) => (
        <Card key={task.id} className="w-full animate-fade-in border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center space-x-4">
            <div className="text-primary">
              {getIcon(task.icon)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-primary">
                {task.name}
              </CardTitle>
              <p className="text-sm text-[#6D6D6D]">{task.description}</p>
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
                className={`h-2 ${getProgressColor(task.progress)}`}
              />
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
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
                              className="flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                              <Checkbox 
                                checked={subtask.completed}
                                onCheckedChange={(checked) => {
                                  updateSubtaskMutation.mutate({
                                    id: subtask.id,
                                    completed: checked as boolean,
                                    progress: checked ? 100 : 0,
                                  });
                                }}
                                className="data-[state=checked]:bg-primary"
                              />
                              <span className={`flex-1 text-[#6D6D6D] ${subtask.completed ? 'line-through' : ''}`}>
                                {subtask.name}
                              </span>
                              <Input
                                type="number"
                                value={subtask.progress}
                                onChange={(e) => {
                                  const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  updateSubtaskMutation.mutate({
                                    id: subtask.id,
                                    progress,
                                    completed: progress === 100,
                                  });
                                }}
                                className="w-20 text-right"
                                min="0"
                                max="100"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSubtask(subtask)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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
      ))}

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taak Bewerken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Naam</label>
              <Input
                value={editingTask?.name || ''}
                onChange={(e) => setEditingTask(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschrijving</label>
              <Input
                value={editingTask?.description || ''}
                onChange={(e) => setEditingTask(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
            <Button
              onClick={() => {
                if (editingTask) {
                  updateTaskMutation.mutate(editingTask);
                  setEditingTask(null);
                }
              }}
            >
              Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSubtask} onOpenChange={() => setEditingSubtask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subtaak Bewerken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Naam</label>
              <Input
                value={editingSubtask?.name || ''}
                onChange={(e) => setEditingSubtask(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschrijving</label>
              <Input
                value={editingSubtask?.description || ''}
                onChange={(e) => setEditingSubtask(prev => prev ? {...prev, description: e.target.value} : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Voortgang (%)</label>
              <Input
                type="number"
                value={editingSubtask?.progress || 0}
                onChange={(e) => {
                  const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  setEditingSubtask(prev => prev ? {...prev, progress} : null);
                }}
                min="0"
                max="100"
              />
            </div>
            <Button
              onClick={() => {
                if (editingSubtask) {
                  updateSubtaskMutation.mutate(editingSubtask);
                  setEditingSubtask(null);
                }
              }}
            >
              Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;