
import { MainHeader } from "@/components/layout/MainHeader";
import { DealSourcingForm } from "@/components/deals/DealSourcingForm";

const DealDesk = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deal Desk</h1>
          <p className="text-sm text-gray-500">Configure and manage your deal sources</p>
        </div>
        <DealSourcingForm />
      </main>
    </div>
  );
};

export default DealDesk;
