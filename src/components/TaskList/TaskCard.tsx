import { Task, Subtask } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useState, useRef, useEffect } from "react";
import TaskCardHeader from "./TaskCardHeader";
import SubtaskList from "./SubtaskList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TaskCardProps {
  task: Task;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Subtask>) => void;
  onSubtaskDelete?: (subtaskId: number) => void;
  onTaskDelete?: (taskId: number) => void;
}

const TaskCard = ({ 
  task, 
  dragHandleProps, 
  onTaskEdit, 
  onSubtaskUpdate,
  onSubtaskDelete,
  onTaskDelete
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<number[]>([]); // Track deleted subtasks
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setEditedTask(task);
        setEditedSubtasks(task.subtasks || []);
        setDeletedSubtaskIds([]); // Reset deleted subtasks on cancel
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, task]);

  const handleSave = async () => {
    // First delete any subtasks marked for deletion
    if (onSubtaskDelete) {
      for (const subtaskId of deletedSubtaskIds) {
        await onSubtaskDelete(subtaskId);
      }
    }

    // Then update the task and remaining subtasks
    onTaskEdit(editedTask);
    editedSubtasks.forEach(subtask => {
      if (JSON.stringify(subtask) !== JSON.stringify(task.subtasks?.find(s => s.id === subtask.id))) {
        onSubtaskUpdate(subtask);
      }
    });

    setIsEditing(false);
    setDeletedSubtaskIds([]); // Reset deleted subtasks after save
  };

  const handleAddSubtask = async () => {
    try {
      const { data: newSubtask, error } = await supabase
        .from('subtasks')
        .insert([{
          task_id: task.id,
          name: 'Nieuwe subtaak',
          priority_score: (editedSubtasks.length || 0) + 1,
          progress: 0,
          completed: false,
        }])
        .select('*')
        .single();

      if (error) throw error;

      setEditedSubtasks([...editedSubtasks, newSubtask]);

      toast({
        title: "Subtaak toegevoegd",
        description: "De nieuwe subtaak is succesvol aangemaakt.",
      });
    } catch (error) {
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het aanmaken van de subtaak.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
    }
  };

  const handleSubtaskDelete = (subtaskId: number) => {
    setEditedSubtasks(prev => prev.filter(s => s.id !== subtaskId));
    setDeletedSubtaskIds(prev => [...prev, subtaskId]);
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
        onAddSubtask={handleAddSubtask}
        onDelete={handleDelete}
      />
      <CardContent className="space-y-4">
        <Progress 
          value={task.progress} 
          className="h-2 bg-gray-100"
        />
        
        {editedSubtasks.length > 0 && (
          <SubtaskList
            taskId={task.id}
            isEditing={isEditing}
            editedSubtasks={editedSubtasks}
            onSubtasksChange={setEditedSubtasks}
            onSubtaskUpdate={onSubtaskUpdate}
            onSubtaskDelete={handleSubtaskDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;