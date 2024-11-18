import { Task, Subtask } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PenTool, Settings, Zap, MoreVertical, Edit3, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface TaskCardProps {
  task: Task;
  index: number;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: Partial<Subtask>) => void;
}

const getIcon = (iconName: string | null) => {
  switch (iconName) {
    case "penTool":
      return <PenTool className="h-5 w-5" />;
    case "settings":
      return <Settings className="h-5 w-5" />;
    default:
      return <Zap className="h-5 w-5" />;
  }
};

const TaskCard = ({ task, index, onTaskEdit, onSubtaskUpdate }: TaskCardProps) => {
  return (
    <Card className="w-full animate-fade-in border-l-4 border-l-primary bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center space-x-4">
        <div>
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="text-primary">
          {getIcon(task.icon)}
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
      <CardContent>
        <div className="mb-4">
          <Progress 
            value={task.progress} 
            className="h-2 bg-gray-100"
          />
        </div>
        <Droppable droppableId={`task-${task.id}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {task.subtasks
                .filter(subtask => !subtask.archived)
                .map((subtask, index) => (
                  <Draggable
                    key={subtask.id}
                    draggableId={`${task.id}-${subtask.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100"
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
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
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default TaskCard;