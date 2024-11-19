import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
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

  return (
    <Card className="w-full animate-fade-in border-l-4 border-l-primary bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center space-x-4">
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-title text-primary">
            {task.name}
          </CardTitle>
          <p className="text-sm text-gray-500 font-sans">{task.description}</p>
        </div>
        <div className="text-2xl font-bold text-primary font-sans">
          {task.progress}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsEditing(true);
            onTaskEdit(task);
          }}
          className="hover:bg-primary/10"
        >
          <Edit2 className="h-4 w-4 text-primary" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={task.progress} 
          className="h-2 bg-gray-100"
        />
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 font-title">Subtaken</h4>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div 
                  key={subtask.id} 
                  className="flex items-center space-x-3 p-2 bg-white rounded-md shadow-sm border border-gray-100 hover:border-primary/20 transition-all group"
                >
                  <Checkbox 
                    checked={subtask.completed}
                    onCheckedChange={(checked) => {
                      onSubtaskUpdate({
                        id: subtask.id,
                        completed: checked as boolean,
                        progress: checked ? 100 : 0,
                      });
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`flex-1 text-gray-700 ${subtask.completed ? 'line-through' : ''}`}>
                    {subtask.name}
                  </span>
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        value={subtask.progress}
                        onChange={(e) => {
                          const progress = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          onSubtaskUpdate({
                            id: subtask.id,
                            progress,
                            completed: progress === 100,
                          });
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
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;