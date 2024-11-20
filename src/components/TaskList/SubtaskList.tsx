import { Task, Subtask } from "@/types";
import { GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface SubtaskListProps {
  taskId: number;
  isEditing: boolean;
  editedSubtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Subtask>) => void;
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
                    className={`flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 hover:border-[#154273]/20 transition-all group ${!isEditing ? 'pointer-events-none' : ''}`}
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
                      className={`${!isEditing ? 'pointer-events-none' : ''} data-[state=checked]:bg-[#154273]`}
                      tabIndex={-1}
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
                      <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''} select-none`}>
                        {subtask.name}
                      </span>
                    )}
                    {isEditing ? (
                      <div className="flex items-center space-x-4 min-w-[200px]">
                        <Slider
                          value={[subtask.progress]}
                          onValueChange={(value) => {
                            onSubtasksChange(
                              editedSubtasks.map(s =>
                                s.id === subtask.id ? { ...s, progress: value[0], completed: value[0] === 100 } : s
                              )
                            );
                          }}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-500 w-12 text-right">
                          {subtask.progress}%
                        </span>
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
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-500 select-none">
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