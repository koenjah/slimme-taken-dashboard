import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TimeEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TimeEntryForm from "./TimeEntryForm";

const fetchTimeEntries = async (): Promise<TimeEntry[]> => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      tasks (name),
      subtasks (name)
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const TimeRegistration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: fetchTimeEntries,
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*)
        `);
      if (error) throw error;
      return data || [];
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry> & { hours: number }) => {
      const { error } = await supabase
        .from('time_entries')
        .insert([entry]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Tijdregistratie toegevoegd",
        description: "De nieuwe tijdregistratie is succesvol aangemaakt.",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry> & { hours: number }) => {
      const { error } = await supabase
        .from('time_entries')
        .update(entry)
        .eq('id', entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Tijdregistratie bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Tijdregistratie verwijderd",
        description: "De tijdregistratie is succesvol verwijderd.",
      });
    },
  });

  if (isLoading) return <div className="animate-pulse">Tijdregistraties Laden...</div>;

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-primary">
          Tijdregistratie
        </CardTitle>
        <Button onClick={() => setIsAddingEntry(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Registratie
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[30%]">Taak</TableHead>
              <TableHead className="w-[30%]">Omschrijving</TableHead>
              <TableHead className="text-center">Uren</TableHead>
              <TableHead className="text-center">Datum</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries?.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium">
                  {entry.tasks?.name || entry.subtasks?.name || 'Onbekende taak'}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-center">{entry.hours}</TableCell>
                <TableCell className="text-center">
                  {new Date(entry.date).toLocaleDateString('nl-NL')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntryMutation.mutate(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {tasks && (
        <>
          <TimeEntryForm
            open={isAddingEntry}
            onOpenChange={setIsAddingEntry}
            tasks={tasks}
            onSubmit={(entry) => createEntryMutation.mutate(entry)}
          />

          <TimeEntryForm
            entry={editingEntry}
            open={!!editingEntry}
            onOpenChange={(open) => !open && setEditingEntry(null)}
            tasks={tasks}
            onSubmit={(entry) => {
              if (editingEntry) {
                updateEntryMutation.mutate({ ...entry, id: editingEntry.id });
              }
            }}
          />
        </>
      )}
    </Card>
  );
};

export default TimeRegistration;