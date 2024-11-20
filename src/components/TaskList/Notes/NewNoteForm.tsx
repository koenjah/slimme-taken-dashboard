import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NewNoteFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const NewNoteForm = ({ value, onChange, onSubmit }: NewNoteFormProps) => {
  return (
    <div className="space-y-2 pt-2 border-t border-gray-100">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Voeg een notitie toe..."
        className="min-h-[80px] text-sm w-full resize-none"
        style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', wordWrap: 'break-word' }}
      />
      <Button
        onClick={onSubmit}
        disabled={!value.trim()}
        size="sm"
        className="w-full"
      >
        Toevoegen
      </Button>
    </div>
  );
};

export default NewNoteForm;