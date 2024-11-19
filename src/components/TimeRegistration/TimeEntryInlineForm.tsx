import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TimeEntry } from "@/types";

const TimeEntryInlineForm = () => {
  const [formData, setFormData] = useState({
    task_id: "",
    subtask_id: "",
    hours: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTimeEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry>) => {
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
      setFormData({
        task_id: "",
        subtask_id: "",
        hours: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTimeEntryMutation.mutate({
      ...formData,
      hours: parseFloat(formData.hours),
      task_id: formData.task_id ? parseInt(formData.task_id) : null,
      subtask_id: formData.subtask_id ? parseInt(formData.subtask_id) : null,
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
        <Input
          placeholder="Titel"
          value={formData.task_id}
          onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
        />
        <Input
          placeholder="Omschrijving"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Input
          type="number"
          step="0.25"
          placeholder="Uren"
          value={formData.hours}
          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Button type="submit">
            Toevoegen
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TimeEntryInlineForm;