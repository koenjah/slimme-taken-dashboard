import { Subtask } from "@/types";
import SubtaskItem from "./SubtaskItem";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface SubtaskListProps {
  taskId: number;
  isEditing: boolean;
  editedSubtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  onSubtaskUpdate: (subtask: Subtask) => void;
  onSubtaskDelete?: (subtaskId: number) => void;
}

const SubtaskList = ({
  taskId,
  isEditing,
  editedSubtasks,
  onSubtasksChange,
  onSubtaskUpdate,
  onSubtaskDelete,
}: SubtaskListProps) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const newSubtasks = Array.from(editedSubtasks);
    const [removed] = newSubtasks.splice(sourceIndex, 1);
    newSubtasks.splice(destIndex, 0, removed);

    // Update priority scores
    const updatedSubtasks = newSubtasks.map((subtask, index) => ({
      ...subtask,
      priority_score: index + 1,
    }));

    onSubtasksChange(updatedSubtasks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`subtasks-${taskId}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {editedSubtasks.map((subtask, index) => (
              <Draggable
                key={subtask.id}
                draggableId={subtask.id.toString()}
                index={index}
                isDragDisabled={!isEditing}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <SubtaskItem
                      subtask={subtask}
                      isEditing={isEditing}
                      onUpdate={onSubtaskUpdate}
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