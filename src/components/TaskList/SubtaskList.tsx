import { Task } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface SubtaskListProps {
  taskId: number;
  isEditing: boolean;
  editedSubtasks: Task[];
  onSubtasksChange: (subtasks: Task[]) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Task>) => void;
  onSubtaskDelete?: (subtaskId: number) => void;
}

const SubtaskList = ({
  taskId,
  isEditing,
  editedSubtasks,
  onSubtasksChange,
  onSubtaskUpdate,
  onSubtaskDelete
}: SubtaskListProps) => {
  const handleSubtaskDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editedSubtasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      priority_score: items.length - index,
    }));

    onSubtasksChange(updatedItems);
  };

  return (
    <DragDropContext onDragEnd={handleSubtaskDragEnd}>
      <Droppable droppableId={`subtasks-${taskId}`} isDropDisabled={!isEditing}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {editedSubtasks.map((subtask, index) => (
              <Draggable 
                key={subtask.id} 
                draggableId={`subtask-${subtask.id}`} 
                index={index}
                isDragDisabled={!isEditing}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 hover:border-[#154273]/20 transition-all group"
                  >
                    {isEditing && (
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <Checkbox 
                      checked={subtask.completed}
                      onCheckedChange={(checked) => {
                        const updatedSubtask = {
                          ...subtask,
                          completed: checked as boolean,
                          progress: checked ? 100 : 0,
                        };
                        if (!isEditing) {
                          onSubtaskUpdate(updatedSubtask);
                        } else {
                          onSubtasksChange(
                            editedSubtasks.map(s => s.id === subtask.id ? updatedSubtask : s)
                          );
                        }
                      }}
                      className="data-[state=checked]:bg-[#154273]"
                    />
                    {isEditing ? (
                      <Input
                        value={subtask.name}
                        onChange={(e) => {
                          onSubtasksChange(
                            editedSubtasks.map(s =>
                              s.id === subtask.id ? { ...s, name: e.target.value } : s
                            )
                          );
                        }}
                        className="flex-1"
                      />
                    ) : (
                      <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
                        {subtask.name}
                      </span>
                    )}
                    {isEditing ? (
                      <>
                        <Input
                          type="number"
                          value={subtask.progress}
                          onChange={(e) => {
                            const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            onSubtasksChange(
                              editedSubtasks.map(s =>
                                s.id === subtask.id ? { ...s, progress, completed: progress === 100 } : s
                              )
                            );
                          }}
                          className="w-20 text-right"
                          min="0"
                          max="100"
                        />
                        {onSubtaskDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSubtaskDelete(subtask.id)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {subtask.progress}%
                      </span>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SubtaskList;