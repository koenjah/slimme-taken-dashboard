import { useQuery } from "@tanstack/react-query";
import { TimeEntry } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { data: entries, isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: fetchTimeEntries,
  });

  if (isLoading) return <div className="animate-pulse">Tijdregistraties Laden...</div>;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#1A1A1A]">
          Tijdregistratie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-[#F8F9FA]">
            <TableRow>
              <TableHead className="w-[40%]">Taak</TableHead>
              <TableHead className="text-center">Uren</TableHead>
              <TableHead className="text-center">Datum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries?.map((entry, index) => (
              <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                <TableCell className="font-medium">
                  {entry.task_id}
                </TableCell>
                <TableCell className="text-center">{entry.hours}</TableCell>
                <TableCell className="text-center">
                  {new Date(entry.date).toLocaleDateString('nl-NL')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TimeRegistration;