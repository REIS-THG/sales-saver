
import { MainHeader } from "@/components/layout/MainHeader";
import { useDealDesk } from "@/hooks/use-deal-desk";
import { DealSelector } from "@/components/deal-desk/DealSelector";
import { SubscriptionAlert } from "@/components/deal-desk/SubscriptionAlert";
import { DocumentsGrid } from "@/components/deal-desk/DocumentsGrid";

const DealDesk = () => {
  const {
    selectedDealId,
    setSelectedDealId,
    deals,
    isGenerating,
    isProSubscription,
    handleGenerate
  } = useDealDesk();

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deal Desk</h1>
          <p className="text-sm text-gray-500">Generate and manage deal documents</p>
        </div>

        {!isProSubscription && <SubscriptionAlert />}

        <DealSelector 
          deals={deals} 
          selectedDealId={selectedDealId} 
          onDealSelect={setSelectedDealId} 
        />

        <DocumentsGrid 
          isGenerating={isGenerating}
          isProSubscription={isProSubscription}
          selectedDealId={selectedDealId}
          onGenerate={handleGenerate}
        />
      </main>
    </div>
  );
};

export default DealDesk;
