
import { MainHeader } from "@/components/layout/MainHeader";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck, Receipt } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const DealDesk = () => {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deal Desk</h1>
          <p className="text-sm text-gray-500">Generate and manage deal documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Statement of Work</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Generate a customized Statement of Work based on deal specifications and requirements.
            </p>
            <Button className="w-full">
              Generate SOW
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Contract</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Create a contract document with terms and conditions based on the deal parameters.
            </p>
            <Button className="w-full">
              Generate Contract
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Invoice</h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Generate an invoice with deal amounts, payment terms, and client details.
            </p>
            <Button className="w-full">
              Generate Invoice
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealDesk;
