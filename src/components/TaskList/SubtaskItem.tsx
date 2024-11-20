import { Subtask } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import ScoreBadge from "./Badges/ScoreBadge";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onUpdate: (subtask: Subtask) => void;
  onDelete?: (subtaskId: number) => void;
}

const SubtaskItem = ({
  subtask,
  isEditing,
  dragHandleProps,
  onUpdate,
  onDelete,
}: SubtaskItemProps) => {
  return (
    <div className="flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100">
      {isEditing && (
        <div {...dragHandleProps}>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={(checked) => {
          onUpdate({
            ...subtask,
            completed: checked as boolean,
            progress: checked ? 100 : 0,
          });
        }}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
        {subtask.name}
      </span>
      <div className="flex items-center space-x-2">
        <ScoreBadge score={subtask.priority_score || 0} max={10} size="sm" />
        <ScoreBadge score={subtask.progress} max={100} variant="progress" size="sm" />
      </div>
      {isEditing && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(subtask.id)}
          className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SubtaskItem;