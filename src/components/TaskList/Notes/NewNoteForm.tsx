import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NewNoteFormProps {
  newNote: string;
  onNewNoteChange: (value: string) => void;
  onAddNote: () => void;
}

const NewNoteForm = ({ newNote, onNewNoteChange, onAddNote }: NewNoteFormProps) => {
  return (
    <div className="space-y-2 pt-4 border-t border-gray-100">
      <Textarea
        value={newNote}
        onChange={(e) => onNewNoteChange(e.target.value)}
        placeholder="Voeg een notitie toe..."
        className="min-h-[60px] text-sm resize-none"
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onAddNote();
        }}
        disabled={!newNote.trim()}
        size="sm"
        className="w-full"
      >
        Toevoegen
      </Button>
    </div>
  );
};

export default NewNoteForm;