
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search deals..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 w-full"
        type="search"
        aria-label="Search deals"
      />
    </div>
  );
}
