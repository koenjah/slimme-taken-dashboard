import { useState, useRef, useEffect } from "react";
import { MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
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
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Position dropdown below the subtask div
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const subtaskDiv = buttonRef.current.closest('.subtask-container');
      if (subtaskDiv) {
        const subtaskRect = subtaskDiv.getBoundingClientRect();
        setDropdownPosition({
          top: subtaskRect.bottom + window.scrollY + 8,
          left: subtaskRect.left + window.scrollX,
        });
      }
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setEditingNoteId(null);
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

  const handleEditNote = async (noteId: number) => {
    if (!editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editedContent.trim() })
        .eq('id', noteId);

      if (error) throw error;

      onNotesChange(notes.map(note => 
        note.id === noteId ? { ...note, content: editedContent.trim() } : note
      ));
      setEditingNoteId(null);
      setEditedContent("");
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

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditedContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditedContent("");
  };

  const handleClick = (e: React.MouseEvent) => {
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
          className="fixed z-50 w-full max-w-[40rem] bg-white rounded-lg shadow-lg border border-gray-100 p-4 space-y-4"
          style={{ 
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="group flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50">
                {editingNoteId === note.id ? (
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note.id);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Opslaan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Annuleren
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm text-gray-700">{note.content}</p>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(note);
                        }}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Voeg een notitie toe..."
              className="min-h-[60px] text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddNote();
              }}
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