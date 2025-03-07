
import { FileText, FileCheck, Receipt } from "lucide-react";
import { DocumentCard } from "./DocumentCard";

interface DocumentsGridProps {
  isGenerating: 'sow' | 'contract' | 'invoice' | null;
  isProSubscription: boolean;
  selectedDealId: string | null;
  onGenerate: (type: 'sow' | 'contract' | 'invoice') => Promise<void>;
}

export function DocumentsGrid({
  isGenerating,
  isProSubscription,
  selectedDealId,
  onGenerate
}: DocumentsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DocumentCard
        title="Statement of Work"
        description="Generate a customized Statement of Work based on deal specifications and requirements."
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        onGenerate={() => onGenerate('sow')}
        isGenerating={isGenerating === 'sow'}
        isDisabled={!selectedDealId || !isProSubscription}
      />

      <DocumentCard
        title="Contract"
        description="Create a contract document with terms and conditions based on the deal parameters."
        icon={<FileCheck className="h-5 w-5 text-green-500" />}
        onGenerate={() => onGenerate('contract')}
        isGenerating={isGenerating === 'contract'}
        isDisabled={!selectedDealId || !isProSubscription}
      />

      <DocumentCard
        title="Invoice"
        description="Generate an invoice with deal amounts, payment terms, and client details."
        icon={<Receipt className="h-5 w-5 text-purple-500" />}
        onGenerate={() => onGenerate('invoice')}
        isGenerating={isGenerating === 'invoice'}
        isDisabled={!selectedDealId || !isProSubscription}
      />
    </div>
  );
}
