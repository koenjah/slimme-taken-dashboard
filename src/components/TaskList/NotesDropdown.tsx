import { useState, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import NoteItem from "./Notes/NoteItem";
import NewNoteForm from "./Notes/NewNoteForm";

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div className="relative" ref={dropdownRef}>
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
        <div className="absolute z-10 left-[-350px] mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-100 p-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Notities</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="space-y-2">
                <NoteItem
                  note={note}
                  editingNote={editingNote}
                  onEdit={setEditingNote}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  onCancelEdit={() => setEditingNote(null)}
                />
                <Separator className="my-2" />
              </div>
            ))}
          </div>
          
          <NewNoteForm
            value={newNote}
            onChange={setNewNote}
            onSubmit={handleAddNote}
          />
        </div>
      )}
    </div>
  );
};

export default NotesDropdown;