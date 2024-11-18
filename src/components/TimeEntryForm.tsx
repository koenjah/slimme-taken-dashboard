import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimeEntry, Task, Subtask } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeEntryFormProps {
  entry?: TimeEntry;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (entry: Partial<TimeEntry>) => void;
}

const TimeEntryForm = ({ entry, tasks, open, onOpenChange, onSubmit }: TimeEntryFormProps) => {
  const [formData, setFormData] = useState({
    task_id: entry?.task_id?.toString() || "",
    subtask_id: entry?.subtask_id?.toString() || "",
    hours: entry?.hours || 0,
    description: entry?.description || "",
    date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const selectedTask = tasks.find(t => t.id.toString() === formData.task_id);
  const subtasks = selectedTask?.subtasks || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      task_id: formData.task_id ? parseInt(formData.task_id) : null,
      subtask_id: formData.subtask_id ? parseInt(formData.subtask_id) : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Time Entry" : "Add Time Entry"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Task</label>
            <Select
              value={formData.task_id}
              onValueChange={(value) => setFormData({ ...formData, task_id: value, subtask_id: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.task_id && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtask</label>
              <Select
                value={formData.subtask_id}
                onValueChange={(value) => setFormData({ ...formData, subtask_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subtask" />
                </SelectTrigger>
                <SelectContent>
                  {subtasks.map((subtask) => (
                    <SelectItem key={subtask.id} value={subtask.id.toString()}>
                      {subtask.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours</label>
            <Input
              type="number"
              step="0.25"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            {entry ? "Save Changes" : "Add Time Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryForm;