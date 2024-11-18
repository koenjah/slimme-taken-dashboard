import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TimeRegistrationProps {
  entry?: TimeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TimeRegistration = ({ entry, open, onOpenChange }: TimeRegistrationProps) => {
  const [formData, setFormData] = useState({
    task_id: entry?.task_id?.toString() || "",
    subtask_id: entry?.subtask_id?.toString() || "",
    hours: entry?.hours || 0,
    description: entry?.description || "",
    date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTimeEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry> & { hours: number }) => {
      const { error } = await supabase
        .from('time_entries')
        .insert([entry]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({
        title: "Tijd geregistreerd",
        description: "De tijd is succesvol geregistreerd.",
      });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry> & { hours: number }) => {
      const { error } = await supabase
        .from('time_entries')
        .update(entry)
        .eq('id', entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({
        title: "Tijd bijgewerkt",
        description: "De tijd is succesvol bijgewerkt.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry) {
      updateTimeEntryMutation.mutate({
        ...formData,
        id: entry.id,
        task_id: formData.task_id ? parseInt(formData.task_id) : null,
        subtask_id: formData.subtask_id ? parseInt(formData.subtask_id) : null,
      });
    } else {
      createTimeEntryMutation.mutate({
        ...formData,
        hours: formData.hours,
        task_id: formData.task_id ? parseInt(formData.task_id) : null,
        subtask_id: formData.subtask_id ? parseInt(formData.subtask_id) : null,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entry ? "Bewerk Tijd Registratie" : "Voeg Tijd Registratie Toe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Uren</label>
            <Input
              type="number"
              step="0.25"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Beschrijving</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschrijving"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            {entry ? "Opslaan Wijzigingen" : "Tijd Registreren"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeRegistration;
