import { Subtask } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { GripVertical } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";

interface TaskSubItemProps {
  subtask: Subtask;
  taskId: number;
  index: number;
  onSubtaskUpdate: (subtask: Partial<Subtask> & { id: number }) => void;
}

const TaskSubItem = ({ subtask, taskId, index, onSubtaskUpdate }: TaskSubItemProps) => {
  return (
    <Draggable
      draggableId={`${taskId}-${subtask.id}`}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div {...provided.dragHandleProps} className="hover:text-[#154273] transition-colors">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <Checkbox 
            checked={subtask.completed}
            onCheckedChange={(checked) => {
              onSubtaskUpdate({
                id: subtask.id,
                completed: checked as boolean,
                progress: checked ? 100 : 0,
              });
            }}
            className="data-[state=checked]:bg-[#154273] data-[state=checked]:border-[#154273]"
          />
          <span className={`flex-1 text-gray-700 font-inter ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
          <Input
            type="number"
            value={subtask.progress}
            onChange={(e) => {
              const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
              onSubtaskUpdate({
                id: subtask.id,
                progress,
                completed: progress === 100,
              });
            }}
            className="w-20 text-right focus:ring-[#154273] font-inter"
            min="0"
            max="100"
          />
        </div>
      )}
    </Draggable>
  );
};

export default TaskSubItem;