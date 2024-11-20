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

const getPriorityColor = (score: number) => {
  // Create a gradient from green (0) to red (10)
  const colors = {
    0: "#4ade80", // Light green
    2.5: "#86efac", // Lighter green
    5: "#fde047", // Yellow
    7.5: "#fb923c", // Orange
    10: "#f87171", // Red
  };

  // Find the two closest colors and interpolate
  const colorPoints = Object.entries(colors).map(([score, color]) => ({
    score: parseFloat(score),
    color,
  }));

  const lowerColor = colorPoints.reduce((prev, curr) => {
    return curr.score <= score && curr.score > prev.score ? curr : prev;
  }, colorPoints[0]);

  const upperColor = colorPoints.reduce((prev, curr) => {
    return curr.score >= score && curr.score < prev.score ? curr : prev;
  }, colorPoints[colorPoints.length - 1]);

  return lowerColor.color;
};

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

  const handleSubtaskComplete = (subtask: Subtask, checked: boolean) => {
    const updatedSubtask = {
      ...subtask,
      completed: checked,
      progress: checked ? 100 : 0,
      archived: checked,
    };

    if (!isEditing) {
      onSubtaskUpdate(updatedSubtask);
    } else {
      onSubtasksChange(
        editedSubtasks.map(s => s.id === subtask.id ? updatedSubtask : s)
      );
    }
  };

  return (
    <DragDropContext onDragEnd={handleSubtaskDragEnd}>
      <Droppable droppableId={`subtasks-${taskId}`} isDropDisabled={!isEditing}>
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className={`space-y-2 ${!isEditing ? 'select-none' : ''}`}
          >
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
                    className={`
                      flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 
                      transition-all group
                      ${isEditing ? 'hover:border-[#154273]/20' : 'pointer-events-none'}
                    `}
                  >
                    {isEditing && (
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <Checkbox 
                      checked={subtask.completed}
                      onCheckedChange={(checked) => handleSubtaskComplete(subtask, checked as boolean)}
                      className="data-[state=checked]:bg-[#154273]"
                      tabIndex={-1}
                      aria-hidden={!isEditing}
                    />
                    <div className="flex-1 space-y-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={subtask.name}
                            onChange={(e) => {
                              onSubtasksChange(
                                editedSubtasks.map(s =>
                                  s.id === subtask.id ? { ...s, name: e.target.value } : s
                                )
                              );
                            }}
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
                                onSubtasksChange(
                                  editedSubtasks.map(s =>
                                    s.id === subtask.id ? { ...s, priority_score: value } : s
                                  )
                                );
                              }}
                              className="w-20"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className={`text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
                            {subtask.name}
                          </span>
                          <div 
                            className="text-sm px-2 py-0.5 rounded-full w-fit"
                            style={{ 
                              backgroundColor: `${getPriorityColor(subtask.priority_score || 0)}20`,
                              color: getPriorityColor(subtask.priority_score || 0),
                            }}
                          >
                            Prioriteit: {subtask.priority_score || 0}
                          </div>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="flex items-center space-x-4 min-w-[200px]">
                        <Slider
                          value={[subtask.progress]}
                          onValueChange={(value) => {
                            onSubtasksChange(
                              editedSubtasks.map(s =>
                                s.id === subtask.id ? { 
                                  ...s, 
                                  progress: value[0], 
                                  completed: value[0] === 100,
                                  archived: value[0] === 100
                                } : s
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