import { Subtask } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import ScoreBadge from "./Badges/ScoreBadge";
import { Slider } from "@/components/ui/slider";

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
      <div className="flex items-center space-x-4">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            max="10"
            value={subtask.priority_score || 0}
            onChange={(e) => {
              const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
              onUpdate({
                ...subtask,
                priority_score: value,
              });
            }}
            className="w-16 text-center"
          />
        ) : (
          <ScoreBadge score={subtask.priority_score || 0} max={10} size="sm" />
        )}
        {isEditing ? (
          <Slider
            value={[subtask.progress]}
            onValueChange={(value) => {
              onUpdate({
                ...subtask,
                progress: value[0],
                completed: value[0] === 100,
              });
            }}
            max={100}
            step={1}
            className="w-24"
          />
        ) : (
          <ScoreBadge score={subtask.progress} max={100} variant="progress" size="sm" />
        )}
      </div>
      {isEditing && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(subtask.id)}
          className="hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SubtaskItem;