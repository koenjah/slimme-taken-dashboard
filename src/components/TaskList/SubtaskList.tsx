import { Subtask } from "@/types";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import SubtaskItem from "./SubtaskItem";

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

    // Update priority scores: lower index = lower number = higher priority
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority_score: index + 1,
    }));

    onSubtasksChange(updatedItems);
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
                  >
                    <SubtaskItem
                      subtask={subtask}
                      isEditing={isEditing}
                      dragHandleProps={provided.dragHandleProps}
                      onUpdate={(updatedSubtask) => {
                        if (!isEditing) {
                          onSubtaskUpdate(updatedSubtask);
                        } else {
                          onSubtasksChange(
                            editedSubtasks.map(s => 
                              s.id === updatedSubtask.id ? updatedSubtask : s
                            )
                          );
                        }
                      }}
                      onDelete={onSubtaskDelete}
                    />
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