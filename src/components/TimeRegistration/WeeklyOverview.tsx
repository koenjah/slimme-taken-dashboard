import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek, getWeek } from "date-fns";
import { nl } from "date-fns/locale";
import { fetchTimeEntries, deleteTimeEntry } from "./mutations";
import TimeEntryForm from "../TimeEntryForm";
import { useToast } from "@/components/ui/use-toast";

const WeeklyOverview = () => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time_entries'],
    queryFn: fetchTimeEntries,
  });

  // Group entries by week
  const entriesByWeek = timeEntries.reduce((acc: Record<string, TimeEntry[]>, entry) => {
    const date = new Date(entry.date);
    const weekStart = startOfWeek(date, { locale: nl });
    const weekKey = format(weekStart, 'yyyy-ww');
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(entry);
    return acc;
  }, {});

  const weeks = Object.entries(entriesByWeek).map(([weekKey, entries]) => {
    const [year, week] = weekKey.split('-');
    const firstEntry = entries[0];
    const date = new Date(firstEntry.date);
    const weekStart = startOfWeek(date, { locale: nl });
    const weekEnd = endOfWeek(date, { locale: nl });
    const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);

    return {
      weekKey,
      weekNumber: week,
      startDate: weekStart,
      endDate: weekEnd,
      entries,
      totalHours,
    };
  }).sort((a, b) => b.weekKey.localeCompare(a.weekKey));

  return (
    <div className="space-y-6 mt-12">
      <h2 className="text-2xl font-title font-semibold">Urenregistratie</h2>
      
      <div className="space-y-4">
        {weeks.map((week) => (
          <Card key={week.weekKey} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-primary">
                  Week {week.weekNumber}
                </span>
                <span className="text-muted-foreground">
                  {format(week.startDate, 'd MMM', { locale: nl })} - {format(week.endDate, 'd MMM yyyy', { locale: nl })}
                </span>
              </div>
              <div className="text-xl font-semibold text-primary">
                {week.totalHours} uur
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Omschrijving</TableHead>
                  <TableHead className="text-right">Uren</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="w-[100px]">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {week.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.tasks?.name || entry.subtasks?.name || "Onbekend"}</TableCell>
                    <TableCell>{entry.description || "-"}</TableCell>
                    <TableCell className="text-right">{entry.hours}</TableCell>
                    <TableCell>{format(new Date(entry.date), 'd MMM yyyy', { locale: nl })}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            deleteTimeEntry(entry.id);
                            toast({
                              title: "Tijdregistratie verwijderd",
                              description: "De tijdregistratie is succesvol verwijderd.",
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>

      <TimeEntryForm
        entry={editingEntry}
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSubmit={() => setEditingEntry(null)}
        tasks={[]}
      />
    </div>
  );
};

export default WeeklyOverview;