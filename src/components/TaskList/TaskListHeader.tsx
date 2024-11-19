import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListHeaderProps {
  onAddTask: () => void;
}

// Header component for task list with add task button
const TaskListHeader = ({ onAddTask }: TaskListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-primary">Taken</h2>
      <Button
        onClick={onAddTask}
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default TaskListHeader;