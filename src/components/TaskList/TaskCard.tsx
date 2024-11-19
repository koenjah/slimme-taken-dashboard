import { Task } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Edit2, Save, GripVertical, Trash2 } from "lucide-react";
import { DraggableProvidedDragHandleProps, DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface TaskCardProps {
  task: Task;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Task>) => void;
  onSubtaskDelete?: (subtaskId: number) => void;
}

const TaskCard = ({ 
  task, 
  dragHandleProps, 
  onTaskEdit, 
  onSubtaskUpdate,
  onSubtaskDelete 
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [editedSubtasks, setEditedSubtasks] = useState(task.subtasks || []);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setEditedTask(task);
        setEditedSubtasks(task.subtasks || []);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, task]);

  const handleSave = () => {
    onTaskEdit(editedTask);
    editedSubtasks.forEach(subtask => {
      if (JSON.stringify(subtask) !== JSON.stringify(task.subtasks?.find(s => s.id === subtask.id))) {
        onSubtaskUpdate(subtask);
      }
    });
    setIsEditing(false);
  };

  const handleSubtaskDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(editedSubtasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priority scores
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority_score: items.length - index,
    }));

    setEditedSubtasks(updatedItems);
  };

  return (
    <Card 
      ref={cardRef}
      className="w-full animate-fade-in border-l-4 border-l-[#154273] bg-white hover:shadow-md transition-all duration-200"
    >
      <CardHeader className="flex flex-row items-center space-x-4">
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-[#154273] transition-colors" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className="font-title text-lg text-[#154273]"
            />
          ) : (
            <h3 className="text-lg font-title text-[#154273]">
              {task.name}
            </h3>
          )}
        </div>
        <div className="text-2xl font-bold text-[#154273] font-sans">
          {task.progress}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={`hover:bg-[#154273]/10 ${isEditing ? 'text-green-500' : 'text-[#154273]'}`}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit2 className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={task.progress} 
          className="h-2 bg-gray-100"
        />
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2">
            <DragDropContext onDragEnd={handleSubtaskDragEnd}>
              <Droppable droppableId={`subtasks-${task.id}`} isDropDisabled={!isEditing}>
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
                                setEditedSubtasks(prev => 
                                  prev.map(s => s.id === subtask.id ? updatedSubtask : s)
                                );
                                if (!isEditing) {
                                  onSubtaskUpdate(updatedSubtask);
                                }
                              }}
                              className="data-[state=checked]:bg-[#154273]"
                            />
                            {isEditing ? (
                              <Input
                                value={subtask.name}
                                onChange={(e) => {
                                  setEditedSubtasks(prev =>
                                    prev.map(s => s.id === subtask.id ? { ...s, name: e.target.value } : s)
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
                                    setEditedSubtasks(prev =>
                                      prev.map(s => s.id === subtask.id ? { ...s, progress, completed: progress === 100 } : s)
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;