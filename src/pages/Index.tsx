import { Card } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TimeRegistration from "@/components/TimeRegistration";
import ArchivedTaskList from "@/components/ArchivedTaskList";
import WeeklyOverview from "@/components/TimeRegistration/WeeklyOverview";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

const Index = () => {
  const [isTimeRegistrationOpen, setIsTimeRegistrationOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const archiveButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowArchive(!showArchive)}
      className="text-gray-600 hover:text-gray-800"
    >
      <Archive className="h-5 w-5" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8">
          {showArchive ? (
            <ArchivedTaskList />
          ) : (
            <>
              <TaskList showArchiveButton={archiveButton} />
              <WeeklyOverview />
            </>
          )}
          <TimeRegistration 
            open={isTimeRegistrationOpen}
            onOpenChange={setIsTimeRegistrationOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;