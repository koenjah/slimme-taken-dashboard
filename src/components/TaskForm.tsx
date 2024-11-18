import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TaskIconSelect from "./TaskIconSelect";
import { Task } from "@/types";

interface TaskFormProps {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<Task>) => void;
}

const TaskForm = ({ task, open, onOpenChange, onSubmit }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    name: task?.name || "",
    description: task?.description || "",
    icon: task?.icon || "zap",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Task name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <TaskIconSelect
              value={formData.icon}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            />
          </div>
          <Button type="submit" className="w-full">
            {task ? "Save Changes" : "Add Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;