import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotesButtonProps {
  notesCount: number;
  isOpen: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const NotesButton = ({ notesCount, isOpen, onClick }: NotesButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`text-gray-500 hover:text-primary ${isOpen ? 'text-primary' : ''}`}
    >
      <MessageSquare className="h-4 w-4" />
      {notesCount > 0 && (
        <span className="ml-1 text-xs">{notesCount}</span>
      )}
    </Button>
  );
};

export default NotesButton;