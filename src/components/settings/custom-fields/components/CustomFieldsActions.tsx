
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CustomFieldsActionsProps {
  onAddField: () => void;
}

export function CustomFieldsActions({ onAddField }: CustomFieldsActionsProps) {
  return (
    <CardFooter>
      <Button onClick={onAddField}>
        <Plus className="mr-2 h-4 w-4" />
        Add Custom Field
      </Button>
    </CardFooter>
  );
}
