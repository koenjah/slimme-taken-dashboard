import { Card } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TimeRegistration from "@/components/TimeRegistration";
import { useState } from "react";

const Index = () => {
  const [isTimeRegistrationOpen, setIsTimeRegistrationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F3F3] py-8">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 bg-primary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <img src="/rijksoverheid-logo.svg" alt="Rijksoverheid" className="h-12" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">AI Brigade Dashboard</h1>
              <p className="text-primary-foreground/80 mt-2">Werkzaamheden van Koen</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          <TaskList />
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