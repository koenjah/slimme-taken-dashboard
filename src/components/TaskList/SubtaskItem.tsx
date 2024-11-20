import { Subtask } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import ScoreBadge from "./Badges/ScoreBadge";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  dragHandleProps?: any;
  onUpdate: (updatedSubtask: Subtask) => void;
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
    <div
      className={`
        flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 
        transition-all group
        ${isEditing ? 'hover:border-[#154273]/20' : 'pointer-events-none'}
      `}
    >
      {isEditing && (
        <div {...dragHandleProps}>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <Checkbox 
        checked={subtask.completed}
        onCheckedChange={(checked) => 
          onUpdate({
            ...subtask,
            completed: checked as boolean,
            progress: checked ? 100 : 0,
            archived: checked,
          })
        }
        className="data-[state=checked]:bg-[#154273]"
        tabIndex={-1}
        aria-hidden={!isEditing}
      />
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex items-center space-x-2">
          <ScoreBadge score={subtask.priority_score || 0} max={10} />
          <ScoreBadge 
            score={subtask.progress} 
            max={100} 
            variant="progress"
          />
        </div>
        {isEditing ? (
          <div className="space-y-2 flex-1">
            <Input
              value={subtask.name}
              onChange={(e) => onUpdate({ ...subtask, name: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Prioriteit:</span>
              <Input
                type="number"
                min="0"
                max="10"
                value={subtask.priority_score || 0}
                onChange={(e) => {
                  const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                  onUpdate({ ...subtask, priority_score: value });
                }}
                className="w-20"
              />
            </div>
          </div>
        ) : (
          <span className={`text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
        )}
      </div>
      {isEditing && (
        <div className="flex items-center space-x-4 min-w-[200px]">
          <Slider
            value={[subtask.progress]}
            onValueChange={(value) => {
              onUpdate({
                ...subtask,
                progress: value[0],
                completed: value[0] === 100,
                archived: value[0] === 100,
              });
            }}
            max={100}
            step={1}
            className="flex-1"
          />
          {onDelete && (
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
      )}
    </div>
  );
};

export default SubtaskItem;