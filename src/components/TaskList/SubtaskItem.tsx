import { Subtask } from "@/types";
import { Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import ScoreBadge from "./Badges/ScoreBadge";
import NotesDropdown from "./NotesDropdown";

interface SubtaskItemProps {
  subtask: Subtask;
  isEditing: boolean;
  onUpdate: (subtask: Subtask) => void;
  onDelete?: (subtaskId: number) => void;
}

const SubtaskItem = ({
  subtask,
  isEditing,
  onUpdate,
  onDelete,
}: SubtaskItemProps) => {
  const { toast } = useToast();
  const [localName, setLocalName] = useState(subtask.name);

  useEffect(() => {
    setLocalName(subtask.name);
  }, [subtask.name]);

  const handleNameUpdate = useCallback((newName: string) => {
    if (newName !== subtask.name) {
      onUpdate({
        ...subtask,
        name: newName,
      });
    }
  }, [subtask, onUpdate]);

  const handleAddNote = async () => {
    try {
      const { data: note, error } = await supabase
        .from('notes')
        .insert([{
          subtask_id: subtask.id,
          content: "",
        }])
        .select()
        .single();

      if (error) throw error;

      onUpdate({
        ...subtask,
        notes: [...(subtask.notes || []), note],
      });

      toast({
        title: "Notitie toegevoegd",
        description: "Een nieuwe notitie is aangemaakt.",
      });
    } catch (error) {
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het aanmaken van de notitie.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {isEditing ? (
        <Input
          type="number"
          min="0"
          max="10"
          value={subtask.priority_score || 0}
          onChange={(e) => {
            const value = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
            onUpdate({
              ...subtask,
              priority_score: value,
            });
          }}
          className="w-16 text-center"
        />
      ) : (
        <ScoreBadge score={subtask.priority_score || 0} max={10} size="sm" />
      )}
      <div className="flex-1 flex items-center space-x-3 p-2 bg-white/80 rounded-md shadow-sm border border-gray-100">
        <Checkbox
          checked={subtask.completed}
          onCheckedChange={(checked) => {
            onUpdate({
              ...subtask,
              completed: checked as boolean,
              progress: checked ? 100 : 0,
            });
          }}
          className="data-[state=checked]:bg-primary"
        />
        {isEditing ? (
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => handleNameUpdate(localName)}
            className="flex-1 min-w-[300px]"
          />
        ) : (
          <span className={`flex-1 min-w-[300px] ${subtask.completed ? 'line-through' : ''}`}>
            {subtask.name}
          </span>
        )}
        <div className="flex items-center justify-end min-w-[250px] relative">
          {isEditing && (!subtask.notes || subtask.notes.length === 0) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleAddNote}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2.5 mr-10">
            {(subtask.notes?.length ?? 0) > 0 && (
              <NotesDropdown
                subtaskId={subtask.id}
                notes={subtask.notes || []}
                onNotesChange={(notes) => onUpdate({ ...subtask, notes })}
              />
            )}
            <span className="text-sm font-medium text-gray-600">{subtask.progress}%</span>
          </div>
          {isEditing ? (
            <>
              <Slider
                value={[subtask.progress]}
                onValueChange={(value) => {
                  onUpdate({
                    ...subtask,
                    progress: value[0],
                    completed: value[0] === 100,
                  });
                }}
                max={100}
                step={1}
                className="w-24"
              />
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(subtask.id)}
                  className="hover:bg-red-50 hover:text-red-500 transition-all ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SubtaskItem;