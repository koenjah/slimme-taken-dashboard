import { Card } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TimeRegistration from "@/components/TimeRegistration";
import ArchivedTaskList from "@/components/ArchivedTaskList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";

const Index = () => {
  const [isTimeRegistrationOpen, setIsTimeRegistrationOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 bg-primary text-white p-6 rounded-lg shadow-lg hover-scale">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-title">AI Brigade</h1>
            <Button
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={() => setShowArchive(!showArchive)}
            >
              <Archive className="h-5 w-5 mr-2" />
              {showArchive ? "Terug naar taken" : "Archief"}
            </Button>
          </div>
          <p className="text-primary-foreground/80 mt-2">Werkzaamheden van Koen</p>
        </header>

        <div className="grid gap-8">
          {showArchive ? (
            <ArchivedTaskList />
          ) : (
            <TaskList />
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