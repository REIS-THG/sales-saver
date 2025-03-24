
import { useState } from "react";
import { DealsTable } from "@/components/deals/DealsTable";
import type { Deal, CustomField, User } from "@/types/types";

interface DashboardContentProps {
  deals: Deal[];
  isLoading: boolean;
  selectedDeals: Deal[];
  onDealSelect: (deal: Deal, selected: boolean) => void;
  onSelectAll: (allDeals: Deal[]) => void;
  onSearch: (query: string) => void;
  onFilterChange: (filterKey: string, value: any) => void;
  filters: Record<string, any>;
  sortField: string;
  setSortField: (field: string) => void;
  sortDirection: string;
  setSortDirection: (direction: string) => void;
  onDeleteDeal: (dealId: string) => Promise<void>;
  onFetchDeals: () => Promise<void>;
  onQuickNote?: (deal: Deal) => void;
  customFields: CustomField[];
  userData?: User | null;
}

export function DashboardContent({
  deals,
  isLoading,
  selectedDeals,
  onDealSelect,
  onSelectAll,
  onSearch,
  onFilterChange,
  filters,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  onDeleteDeal,
  onFetchDeals,
  onQuickNote,
  customFields,
  userData
}: DashboardContentProps) {
  const [showCustomFields, setShowCustomFields] = useState(false);

  return (
    <DealsTable
      deals={deals}
      customFields={customFields}
      showCustomFields={showCustomFields}
      onSelectionChange={(selectedDeals) => {
        selectedDeals.forEach(deal => {
          onDealSelect(deal, true);
        });
      }}
      fetchDeals={onFetchDeals}
      userData={userData}
      onQuickNote={onQuickNote}
    />
  );
}
