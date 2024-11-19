import { Task } from "@/types";
import { GripVertical, Edit2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface TaskCardHeaderProps {
  task: Task;
  isEditing: boolean;
  editedTask: Task;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onEditedTaskChange: (task: Task) => void;
  onSave: () => void;
  onEditToggle: () => void;
  onAddSubtask: () => void;
  onDelete?: () => void;
}

const TaskCardHeader = ({
  task,
  isEditing,
  editedTask,
  dragHandleProps,
  onEditedTaskChange,
  onSave,
  onEditToggle,
  onAddSubtask,
  onDelete
}: TaskCardHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="flex flex-row items-center space-x-4 p-6">
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-[#154273] transition-colors" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedTask.name}
              onChange={(e) => onEditedTaskChange({ ...editedTask, name: e.target.value })}
              className="font-title text-lg text-[#154273]"
            />
          ) : (
            <h3 className="text-lg font-title text-[#154273]">
              {task.name}
            </h3>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={editedTask.progress}
              onChange={(e) => {
                const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                onEditedTaskChange({ ...editedTask, progress });
              }}
              className="w-20 text-right"
              min="0"
              max="100"
            />
            <span className="text-2xl font-bold text-[#154273] font-sans">%</span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-[#154273] font-sans">
            {task.progress}%
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={isEditing ? onSave : onEditToggle}
            className={`hover:bg-[#154273]/10 ${isEditing ? 'text-green-500' : 'text-[#154273]'}`}
          >
            {isEditing ? (
              <Save className="h-4 w-4" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
          </Button>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddSubtask}
              className="hover:bg-[#154273]/10 text-[#154273]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {isEditing && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:bg-red-100 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je zeker dat je deze taak wilt verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. Alle subtaken worden ook verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCardHeader;