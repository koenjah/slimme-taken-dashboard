import { Note } from "@/types";
import NoteItem from "./NoteItem";
import NewNoteForm from "./NewNoteForm";

interface NotesDropdownContentProps {
  notes: Note[];
  newNote: string;
  onNewNoteChange: (value: string) => void;
  onAddNote: () => void;
  onEditNote: (noteId: number, content: string) => void;
  onDeleteNote: (noteId: number) => void;
}

const NotesDropdownContent = ({
  notes,
  newNote,
  onNewNoteChange,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: NotesDropdownContentProps) => {
  return (
    <>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
      <NewNoteForm
        newNote={newNote}
        onNewNoteChange={onNewNoteChange}
        onAddNote={onAddNote}
      />
    </>
  );
};

export default NotesDropdownContent;