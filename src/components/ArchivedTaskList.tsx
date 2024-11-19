import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types";
import TaskCard from "./TaskList/TaskCard";
import { fetchArchivedTasks, updateTask, updateSubtask } from "./TaskList/mutations";
import { useToast } from "@/components/ui/use-toast";

const ArchivedTaskList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  if (isLoading) return <div className="animate-pulse">Archief Laden...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-primary">Archief</h2>
      <div className="space-y-4">
        {archivedTasks?.map((task) => (
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
              updateSubtaskMutation.mutate({
                id: subtaskId,
                archived: true
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchivedTaskList;