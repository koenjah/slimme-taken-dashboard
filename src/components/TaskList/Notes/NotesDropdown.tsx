import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import NotesContent from "./NotesContent";

interface NotesDropdownProps {
  taskId?: number;
  subtaskId?: number;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
}

const NotesDropdown = ({ taskId, subtaskId, notes, onNotesChange }: NotesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update dropdown position when scrolling or opening
  const updatePosition = () => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const subtaskDiv = buttonRef.current.closest('.subtask-container');
      if (subtaskDiv) {
        const subtaskRect = subtaskDiv.getBoundingClientRect();
        setDropdownPosition({
          top: subtaskRect.bottom + window.scrollY,
          left: subtaskRect.left + window.scrollX,
        });
      }
    }
  };

  useEffect(() => {
    updatePosition();
    // Update position on scroll
    window.addEventListener('scroll', updatePosition, true);
    return () => window.removeEventListener('scroll', updatePosition, true);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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

  const handleEditNote = async (noteId: number, content: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: content.trim() })
        .eq('id', noteId);

      if (error) throw error;

      onNotesChange(notes.map(note => 
        note.id === noteId ? { ...note, content: content.trim() } : note
      ));
      toast({
        title: "Notitie bijgewerkt",
        description: "De notitie is succesvol bijgewerkt.",
      });
    } catch (error) {
      toast({
        title: "Fout bij bewerken",
        description: "Er is een fout opgetreden bij het bewerken van de notitie.",
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (!isOpen && notes.length === 0) return null;

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`text-gray-500 hover:text-primary ${isOpen ? 'text-primary' : ''}`}
      >
        <MessageSquare className="h-4 w-4" />
        {notes.length > 0 && (
          <span className="ml-1 text-xs">{notes.length}</span>
        )}
      </Button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full max-w-[40rem] bg-white rounded-lg shadow-lg border border-gray-100 p-4"
          style={{ 
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <NotesContent
            notes={notes}
            newNote={newNote}
            onNewNoteChange={setNewNote}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      )}
    </div>
  );
};

export default NotesDropdown;