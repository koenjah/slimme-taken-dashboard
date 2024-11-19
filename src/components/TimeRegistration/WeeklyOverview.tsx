import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimeEntry } from "@/types";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { nl } from "date-fns/locale";
import { fetchTimeEntries } from "./mutations";
import WeekCard from "./WeekCard";
import TimeEntryInlineForm from "./TimeEntryInlineForm";

const WeeklyOverview = () => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

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
          <WeekCard
            key={week.weekKey}
            weekNumber={week.weekNumber}
            startDate={week.startDate}
            endDate={week.endDate}
            entries={week.entries}
            totalHours={week.totalHours}
            onEditEntry={setEditingEntry}
          />
        ))}
        
        <TimeEntryInlineForm 
          editingEntry={editingEntry}
          onEditComplete={() => setEditingEntry(null)}
        />
      </div>
    </div>
  );
};

export default WeeklyOverview;