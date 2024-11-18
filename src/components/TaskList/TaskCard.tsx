import { Task, Subtask } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PenTool, Settings, Zap, MoreVertical, Edit3, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Droppable } from "react-beautiful-dnd";
import TaskSubItem from "./TaskSubItem";

interface TaskCardProps {
  task: Task;
  onTaskEdit: (task: Task) => void;
  onSubtaskUpdate: (subtask: Partial<Subtask> & { id: number }) => void;
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

const TaskCard = ({ task, onTaskEdit, onSubtaskUpdate }: TaskCardProps) => {
  return (
    <Card className="w-full animate-fade-in border-l-4 border-l-[#154273] bg-white backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center space-x-4">
        <div className="text-gray-400 hover:text-[#154273] transition-colors">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="text-[#154273]">
          {getIcon(task.icon)}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-bold text-[#154273] font-poppins">
            {task.name}
          </CardTitle>
          <p className="text-sm text-gray-500 font-inter">{task.description}</p>
        </div>
        <div className="text-2xl font-bold text-[#154273] font-poppins">
          {task.progress}%
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:text-[#154273] transition-colors">
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
                  <TaskSubItem
                    key={subtask.id}
                    subtask={subtask}
                    taskId={task.id}
                    index={index}
                    onSubtaskUpdate={onSubtaskUpdate}
                  />
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