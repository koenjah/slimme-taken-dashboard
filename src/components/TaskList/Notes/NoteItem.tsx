import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";

interface NoteItemProps {
  note: Note;
  editingNote: Note | null;
  onEdit: (note: Note) => void;
  onUpdate: (note: Note) => void;
  onDelete: (noteId: number) => void;
  onCancelEdit: () => void;
}

const NoteItem = ({ 
  note, 
  editingNote, 
  onEdit, 
  onUpdate, 
  onDelete, 
  onCancelEdit 
}: NoteItemProps) => {
  if (editingNote?.id === note.id) {
    return (
      <div className="space-y-2">
        <Textarea
          value={editingNote.content}
          onChange={(e) => onEdit({ ...editingNote, content: e.target.value })}
          className="min-h-[60px] text-sm w-full resize-none"
          style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', wordWrap: 'break-word' }}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            Annuleren
          </Button>
          <Button size="sm" onClick={() => onUpdate(editingNote)}>
            Opslaan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-gray-50 p-3 rounded-md">
      <div className="flex justify-between items-start">
        <p 
          className="text-sm text-gray-700 flex-1 whitespace-pre-wrap break-words" 
          style={{ maxHeight: '200px', overflowY: 'auto' }}
        >
          {note.content}
        </p>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="h-6 w-6 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;