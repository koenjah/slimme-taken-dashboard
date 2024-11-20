import { Task } from "@/types";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotesDropdown from "./NotesDropdown";
import ScoreBadge from "./Badges/ScoreBadge";
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
  onEditedTaskChange: (task: Task) => void;
  onSave: () => void;
  onAddSubtask: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
}

const TaskCardHeader = ({
  task,
  isEditing,
  editedTask,
  onEditedTaskChange,
  onSave,
  onAddSubtask,
  onDelete,
  showEditButton = true
}: TaskCardHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="flex flex-row items-center space-x-4 p-6">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            max="10"
            value={editedTask.priority_score || 0}
            onChange={(e) => {
              const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
              onEditedTaskChange({ ...editedTask, priority_score: value });
            }}
            className="w-16 text-center"
          />
        ) : (
          <ScoreBadge score={task.priority_score || 0} max={10} size="lg" />
        )}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedTask.name}
                onChange={(e) => onEditedTaskChange({ ...editedTask, name: e.target.value })}
                className="font-title text-lg text-[#154273]"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-title text-[#154273]">
                  {task.name}
                </h3>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <NotesDropdown
            taskId={task.id}
            notes={isEditing ? editedTask.notes || [] : task.notes || []}
            onNotesChange={(notes) => {
              if (isEditing) {
                onEditedTaskChange({ ...editedTask, notes });
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddSubtask}
            className="hover:bg-[#154273]/10 text-[#154273]"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="hover:bg-[#154273]/10 text-green-500"
              >
                <Save className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
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