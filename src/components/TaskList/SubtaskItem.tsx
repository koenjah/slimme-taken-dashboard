import { Subtask } from "@/types";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import NotesDropdown from "./NotesDropdown";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  dragHandleProps?: any;
  onUpdate: (subtask: { id: number } & Partial<Subtask>) => void;
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
    <div className="flex items-center gap-3">
      {isEditing && (
        <div {...dragHandleProps}>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={(checked) => {
          onUpdate({
            id: subtask.id,
            completed: checked as boolean,
            progress: checked ? 100 : 0,
          });
        }}
        className="data-[state=checked]:bg-primary"
      />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-3">
          <Input
            value={subtask.name}
            onChange={(e) => {
              onUpdate({
                id: subtask.id,
                name: e.target.value,
              });
            }}
            className="flex-1"
          />
          <NotesDropdown
            subtaskId={subtask.id}
            notes={subtask.notes || []}
            onNotesChange={(notes) => onUpdate({ ...subtask, notes })}
          />
          <Slider
            value={[subtask.progress]}
            onValueChange={(value) => {
              onUpdate({
                id: subtask.id,
                progress: value[0],
                completed: value[0] === 100,
              });
            }}
            max={100}
            step={1}
            className="w-24"
          />
          {onDelete && (
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
      ) : (
        <>
          <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
          <div className="flex items-center gap-3">
            {(subtask.notes?.length ?? 0) > 0 && (
              <NotesDropdown
                subtaskId={subtask.id}
                notes={subtask.notes || []}
                onNotesChange={(notes) => onUpdate({ ...subtask, notes })}
              />
            )}
            <span className="text-sm font-medium text-gray-600">{subtask.progress}%</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SubtaskItem;