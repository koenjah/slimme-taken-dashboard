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
        className="bg-[#154273] hover:bg-[#154273]/90 transition-all duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nieuwe Taak
      </Button>
    </div>
  );
};

export default TaskHeader;