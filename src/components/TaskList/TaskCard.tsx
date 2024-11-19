import { Task, Subtask } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useState, useRef, useEffect } from "react";
import TaskCardHeader from "./TaskCardHeader";
import SubtaskList from "./SubtaskList";

interface TaskCardProps {
  task: Task;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Subtask>) => void;
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
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>(task.subtasks || []);
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

  return (
    <Card 
      ref={cardRef}
      className="w-full animate-fade-in border-l-4 border-l-[#154273] bg-white hover:shadow-md transition-all duration-200"
    >
      <TaskCardHeader
        task={task}
        isEditing={isEditing}
        editedTask={editedTask}
        dragHandleProps={dragHandleProps}
        onEditedTaskChange={setEditedTask}
        onSave={handleSave}
        onEditToggle={() => setIsEditing(true)}
      />
      <CardContent className="space-y-4">
        <Progress 
          value={task.progress} 
          className="h-2 bg-gray-100"
        />
        
        {task.subtasks && task.subtasks.length > 0 && (
          <SubtaskList
            taskId={task.id}
            isEditing={isEditing}
            editedSubtasks={editedSubtasks}
            onSubtasksChange={setEditedSubtasks}
            onSubtaskUpdate={onSubtaskUpdate}
            onSubtaskDelete={onSubtaskDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;