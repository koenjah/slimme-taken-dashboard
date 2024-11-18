import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

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
    if (progress < 34) return "bg-[#DC3545]";
    if (progress < 67) return "bg-[#FFC107]";
    return "bg-[#28A745]";
  };

  const getIcon = (iconName: string | null) => {
    switch (iconName) {
      case "penTool":
        return <PenTool className="h-5 w-5" />;
      case "settings":
        return <Settings className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {tasks?.map((task) => (
        <Card key={task.id} className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center space-x-4">
            {task.icon && (
              <div className="text-gray-600">
                {getIcon(task.icon)}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-[#1A1A1A]">
                {task.name}
              </CardTitle>
              <p className="text-sm text-[#6D6D6D]">{task.description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress 
                value={task.progress} 
                className={`h-2 ${getProgressColor(task.progress)}`}
              />
            </div>
            <div className="space-y-3">
              {task.subtasks.map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Checkbox 
                    checked={subtask.completed}
                    className="data-[state=checked]:bg-[#28A745]"
                  />
                  <span className={`flex-1 text-[#6D6D6D] ${subtask.completed ? 'line-through' : ''}`}>
                    {subtask.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskList;