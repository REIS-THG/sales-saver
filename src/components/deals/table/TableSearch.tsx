
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, onChange, value]);

  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search all columns..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
