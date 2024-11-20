import { Task } from "@/types";
import { GripVertical, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { Slider } from "@/components/ui/slider";
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
  onAddSubtask: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
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

const TaskCardHeader = ({
  task,
  isEditing,
  editedTask,
  dragHandleProps,
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
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-[#154273] transition-colors" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedTask.name}
                onChange={(e) => onEditedTaskChange({ ...editedTask, name: e.target.value })}
                className="font-title text-lg text-[#154273]"
              />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Prioriteit:</span>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={editedTask.priority_score || 0}
                  onChange={(e) => {
                    const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                    onEditedTaskChange({ ...editedTask, priority_score: value });
                  }}
                  className="w-20"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-lg font-title text-[#154273]">
                {task.name}
              </h3>
              <div 
                className="text-sm px-2 py-0.5 rounded-full w-fit"
                style={{ 
                  backgroundColor: `${getPriorityColor(task.priority_score || 0)}20`,
                  color: getPriorityColor(task.priority_score || 0),
                }}
              >
                Prioriteit: {task.priority_score || 0}
              </div>
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center space-x-4 min-w-[200px]">
            <Slider
              value={[editedTask.progress]}
              onValueChange={(value) => {
                onEditedTaskChange({ ...editedTask, progress: value[0] });
              }}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-500 w-12 text-right">
              {editedTask.progress}%
            </span>
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
                  className="hover:bg-red-100 text-red-500"
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