import { Card } from "@/components/ui/card";
import TaskList from "@/components/TaskList";
import TimeRegistration from "@/components/TimeRegistration";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Brigade</h1>
          <p className="text-gray-600 mt-2">Werkzaamheden van voortgang</p>
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