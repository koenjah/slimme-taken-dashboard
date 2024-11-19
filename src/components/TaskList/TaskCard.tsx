import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Edit3, GripVertical, MoreVertical } from "lucide-react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: { id: number } & Partial<Task>) => void;
}

const TaskCard = ({ task, dragHandleProps, onTaskEdit, onSubtaskUpdate }: TaskCardProps) => {
  return (
    <Card className="w-full animate-fade-in border-l-4 border-l-primary bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center space-x-4">
        <div {...dragHandleProps}>
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-bold text-primary">
            {task.name}
          </CardTitle>
          <p className="text-sm text-gray-500">{task.description}</p>
        </div>
        <div className="text-2xl font-bold text-primary">
          {task.progress}%
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onTaskEdit(task)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Bewerken
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={task.progress} 
          className="h-2 bg-gray-100"
        />
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Subtaken</h4>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100">
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
                  <span className="text-sm font-medium text-gray-500">
                    {subtask.progress}%
                  </span>
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