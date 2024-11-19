import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types";
import TaskCard from "./TaskList/TaskCard";
import { fetchArchivedTasks } from "./TaskList/mutations";

const ArchivedTaskList = () => {
  const { data: archivedTasks, isLoading } = useQuery({
    queryKey: ['archivedTasks'],
    queryFn: fetchArchivedTasks,
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
            onTaskEdit={() => {}}
            onSubtaskUpdate={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default ArchivedTaskList;