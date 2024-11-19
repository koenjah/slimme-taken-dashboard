import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  onAddTask: () => void;
}

const TaskHeader = ({ onAddTask }: TaskHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-[#154273] font-poppins">Taken</h2>
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

export default TaskHeader;