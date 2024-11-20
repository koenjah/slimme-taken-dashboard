import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListHeaderProps {
  onAddTask: () => void;
  showArchiveButton: () => React.ReactNode;
}

const TaskListHeader = ({ onAddTask, showArchiveButton }: TaskListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-[#154273] font-title">Taken</h2>
      <div className="flex items-center gap-2">
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
    </div>
  );
};

export default TaskListHeader;