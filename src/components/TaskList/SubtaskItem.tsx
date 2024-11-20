import { Subtask } from "@/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  onUpdate: (subtask: Subtask) => void;
  onDelete?: (subtaskId: number) => void;
}

const SubtaskItem = ({
  subtask,
  isEditing,
  onUpdate,
  onDelete,
}: SubtaskItemProps) => {
  // Local state for editing, only updates parent on save
  const [localName, setLocalName] = useState(subtask.name);

  // Sync local state when subtask prop changes
  useEffect(() => {
    setLocalName(subtask.name);
  }, [subtask.name]);

  const handleSave = () => {
    if (localName !== subtask.name) {
      onUpdate({
        ...subtask,
        name: localName,
      });
    }
  };

  return (
    <div className="flex items-center space-x-3">
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
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleSave}
            className="flex-1 min-w-[300px]"
          />
        ) : (
          <span className={`flex-1 min-w-[300px] ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
        )}
        <div className="flex items-center justify-end min-w-[100px]">
          <span className="text-sm font-medium text-gray-600 mr-2">
            {subtask.progress}%
          </span>
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
    </div>
  );
};

export default SubtaskItem;