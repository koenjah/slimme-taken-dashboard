import { useState } from "react";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface NotesDropdownProps {
  taskId?: number;
  subtaskId?: number;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

const NotesDropdown = ({ taskId, subtaskId, notes, onNotesChange }: NotesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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

  const handleUpdateNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: note.content })
        .eq('id', note.id);

      if (error) throw error;

      onNotesChange(notes.map(n => n.id === note.id ? note : n));
      setEditingNote(null);
      toast({
        title: "Notitie bijgewerkt",
        description: "De wijzigingen zijn succesvol opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de notitie.",
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
        <div className="absolute z-10 -left-[300px] mt-[-32px] w-[280px] bg-white rounded-lg shadow-lg border border-gray-100 p-4 space-y-4">
          <div className="max-h-[300px] overflow-y-auto space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="space-y-2">
                {editingNote?.id === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingNote(null)}
                      >
                        Annuleren
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateNote(editingNote)}
                      >
                        Opslaan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700 flex-1">{note.content}</p>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note)}
                          className="h-6 w-6 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <Separator className="my-2" />
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Voeg een notitie toe..."
              className="min-h-[80px] text-sm"
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