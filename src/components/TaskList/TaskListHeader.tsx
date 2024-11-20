import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListHeaderProps {
  onAddTask: () => void;
  showArchiveButton: () => React.ReactNode;
}

const TaskListHeader = ({ onAddTask, showArchiveButton }: TaskListHeaderProps) => {
  return (
    <div className="flex justify-end items-center gap-2">
      {showArchiveButton()}
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