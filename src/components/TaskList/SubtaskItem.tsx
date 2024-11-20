import { Subtask } from "@/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import ScoreBadge from "./Badges/ScoreBadge";
import NotesDropdown from "./NotesDropdown";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  onUpdate: (subtask: Subtask) => void;
  onDelete?: (subtaskId: number) => void;
  dragHandleProps?: any;
}

const SubtaskItem = ({
  subtask,
  isEditing,
  onUpdate,
  onDelete,
  dragHandleProps,
}: SubtaskItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    // Only trigger if not clicking the notes dropdown
    if (!(e.target as HTMLElement).closest('.notes-dropdown')) {
      // Your existing click handling logic
    }
  };

  return (
    <div className="flex items-center space-x-3" onClick={handleClick}>
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
      <div className="flex-1 flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100">
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
        {isEditing ? (
          <Input
            value={subtask.name}
            onChange={(e) => {
              onUpdate({
                ...subtask,
                name: e.target.value,
              });
            }}
            className="flex-1"
          />
        ) : (
          <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
        )}
        <div className="flex items-center space-x-4">
          <div className="notes-dropdown">
            <NotesDropdown
              subtaskId={subtask.id}
              notes={subtask.notes || []}
              onNotesChange={(notes) => onUpdate({ ...subtask, notes })}
            />
          </div>
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
            <span className="text-sm font-medium text-gray-600">{subtask.progress}%</span>
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
    </div>
  );
};

export default SubtaskItem;