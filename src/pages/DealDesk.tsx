
import { MainHeader } from "@/components/layout/MainHeader";
import { Button } from "@/components/ui/button";
import { FileText, FileCheck, Receipt, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Deal } from "@/types/types";

const DealDesk = () => {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isGenerating, setIsGenerating] = useState<'sow' | 'contract' | 'invoice' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch deals when component mounts
  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data: dealsData, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      return;
    }

    // Cast the data to match the Deal type
    const typedDeals = dealsData?.map(deal => ({
      ...deal,
      status: deal.status as Deal['status'],
      custom_fields: (deal.custom_fields || {}) as Record<string, any>,
      contact_email: deal.contact_email || null,
      contact_first_name: deal.contact_first_name || null,
      contact_last_name: deal.contact_last_name || null,
      company_url: deal.company_url || null,
      notes: deal.notes || null,
      team_id: deal.team_id || null,
      health_score: deal.health_score || 0,
      next_action: deal.next_action || null,
      notes_count: deal.notes_count || 0,
      last_contacted: deal.last_contacted || null,
      last_note_at: deal.last_note_at || null,
      expected_close_date: deal.expected_close_date || null,
      start_date: deal.start_date || null
    })) ?? [];

    setDeals(typedDeals);
  };

  const handleGenerate = async (type: 'sow' | 'contract' | 'invoice') => {
    if (!selectedDealId) {
      toast({
        title: "Select a Deal",
        description: "Please select a deal to generate the document.",
      });
      return;
    }

    setIsGenerating(type);
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', selectedDealId)
        .single();

      if (dealError) throw new Error("Failed to fetch deal details");

      // Call the appropriate edge function based on document type
      const response = await supabase.functions.invoke(`generate-${type}`, {
        body: { dealId: selectedDealId, dealData }
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Success",
        description: `${type.toUpperCase()} generated successfully. Check your email for the document.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deal Desk</h1>
          <p className="text-sm text-gray-500">Generate and manage deal documents</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Deal
          </label>
          <Select value={selectedDealId || ''} onValueChange={setSelectedDealId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a deal" />
            </SelectTrigger>
            <SelectContent>
              {deals.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.deal_name} - {deal.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Button 
              className="w-full" 
              onClick={() => handleGenerate('sow')}
              disabled={!selectedDealId || isGenerating === 'sow'}
            >
              {isGenerating === 'sow' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate SOW'
              )}
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
            <Button 
              className="w-full"
              onClick={() => handleGenerate('contract')}
              disabled={!selectedDealId || isGenerating === 'contract'}
            >
              {isGenerating === 'contract' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Contract'
              )}
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
            <Button 
              className="w-full"
              onClick={() => handleGenerate('invoice')}
              disabled={!selectedDealId || isGenerating === 'invoice'}
            >
              {isGenerating === 'invoice' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Invoice'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealDesk;
