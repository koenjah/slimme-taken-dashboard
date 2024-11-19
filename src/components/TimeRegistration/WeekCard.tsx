import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TimeEntry } from "@/types";
import { deleteTimeEntry } from "./mutations";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface WeekCardProps {
  weekNumber: string;
  startDate: Date;
  endDate: Date;
  entries: TimeEntry[];
  totalHours: number;
  onEditEntry: (entry: TimeEntry) => void;
}

const WeekCard = ({ weekNumber, startDate, endDate, entries, totalHours, onEditEntry }: WeekCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: number) => {
    try {
      await deleteTimeEntry(id);
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast({
        title: "Tijdregistratie verwijderd",
        description: "De tijdregistratie is succesvol verwijderd.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de tijdregistratie.",
        variant: "destructive",
      });
    }
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-primary">
            Week {weekNumber}
          </span>
          <span className="text-muted-foreground">
            {format(startDate, 'd MMM', { locale: nl })} - {format(endDate, 'd MMM yyyy', { locale: nl })}
          </span>
        </div>
        <div className="text-xl font-semibold text-primary">
          {totalHours} uur
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
          {entries.map((entry) => (
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
                    onClick={() => onEditEntry(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
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
  );
};

export default WeekCard;