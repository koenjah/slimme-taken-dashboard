import { Card } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TimeRegistration from "@/components/TimeRegistration";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">AI Brigade</h1>
          <p className="text-primary/80 mt-2">Werkzaamheden van Koen</p>
        </header>

        <div className="grid gap-8">
          <TaskList />
          <TimeRegistration />
        </div>
      </div>
    </div>
  );
};

export default Index;