import React, { useState } from "react";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Pencil, Trash2 } from "lucide-react";

interface NoteItemProps {
  note: Note;
  onEdit: (noteId: number, content: string) => void;
  onDelete: (noteId: number) => void;
}

const NoteItem = ({ note, onEdit, onDelete }: NoteItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  const handleSave = () => {
    onEdit(note.id, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="group flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50">
      {isEditing ? (
        <div className="flex-1 space-y-2">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
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
                handleCancel();
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
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
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
                onDelete(note.id);
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 max-h-[200px] overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words pr-2">
              {note.content}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteItem;