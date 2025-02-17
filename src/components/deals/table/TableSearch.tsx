
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search all columns..."
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
