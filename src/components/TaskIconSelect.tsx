import { PenTool, Settings, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const icons = [
  { value: "penTool", label: "Pen", icon: <PenTool className="h-4 w-4" /> },
  { value: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { value: "zap", label: "Zap", icon: <Zap className="h-4 w-4" /> },
];

interface TaskIconSelectProps {
  value: string | null;
  onValueChange: (value: string) => void;
}

const TaskIconSelect = ({ value, onValueChange }: TaskIconSelectProps) => {
  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select icon" />
      </SelectTrigger>
      <SelectContent>
        {icons.map((icon) => (
          <SelectItem key={icon.value} value={icon.value}>
            <div className="flex items-center gap-2">
              {icon.icon}
              <span>{icon.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TaskIconSelect;