import { useMemo } from "react";
import { format, parseISO } from "date-fns";

export const useAxisFormatter = () => {
  // Memoize the formatXAxis function to prevent unnecessary re-renders
  return useMemo(() => {
    return (tickItem: string) => {
      if (!tickItem) return '';
      try {
        // Check if the tickItem is a valid date
        const date = parseISO(tickItem);
        return format(date, 'MMM d');
      } catch {
        // For long text items, truncate to keep chart readable
        return tickItem.length > 15 ? `${tickItem.substring(0, 15)}...` : tickItem;
      }
    };
  }, []);
};
