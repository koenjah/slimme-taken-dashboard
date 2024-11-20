import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface NotesDropdownProps {
  taskId?: number;
  subtaskId?: number;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

const NotesDropdown = ({ taskId, subtaskId, notes, onNotesChange }: NotesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data: note, error } = await supabase
        .from('notes')
        .insert([{
          task_id: taskId,
          subtask_id: subtaskId,
          content: newNote.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      onNotesChange([...notes, note]);
      setNewNote("");
      setIsOpen(false); // Close the dropdown after adding a note
      toast({
        title: "Notitie toegevoegd",
        description: "De notitie is succesvol opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Fout bij toevoegen",
        description: "Er is een fout opgetreden bij het opslaan van de notitie.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      onNotesChange(notes.filter(note => note.id !== noteId));
      toast({
        title: "Notitie verwijderd",
        description: "De notitie is succesvol verwijderd.",
      });
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de notitie.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen && notes.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-gray-500 hover:text-primary ${isOpen ? 'text-primary' : ''}`}
      >
        <MessageSquare className="h-4 w-4" />
        {notes.length > 0 && (
          <span className="ml-1 text-xs">{notes.length}</span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 p-4 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start space-x-2">
              <p className="flex-1 text-sm text-gray-700">{note.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          ))}
          
          <div className="space-y-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Voeg een notitie toe..."
              className="min-h-[60px] text-sm"
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              size="sm"
              className="w-full"
            >
              Toevoegen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesDropdown;