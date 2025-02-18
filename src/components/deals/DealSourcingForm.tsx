
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import type { Deal } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PotentialDeal extends Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  confidence_score?: number;
  source_url?: string;
}

export function DealSourcingForm() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dealType, setDealType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [potentialDeals, setPotentialDeals] = useState<PotentialDeal[]>([]);
  const { toast } = useToast();

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault();
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleCreateDeal = async (deal: PotentialDeal) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const dealData = {
        ...deal,
        user_id: userData.user?.id,
        status: 'open' as const,
        health_score: 50,
      };

      const { error: dealError } = await supabase
        .from('deals')
        .insert([dealData]);

      if (dealError) throw dealError;

      toast({
        title: "Success",
        description: "Deal created successfully",
      });

      // Remove the deal from potential deals
      setPotentialDeals(prev => prev.filter(d => d.deal_name !== deal.deal_name));
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create deal",
      });
    }
  };

  const handleSearch = async () => {
    if (!keywords.length || !location || !dealType || !minAmount || !maxAmount) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-deals', {
        body: {
          keywords,
          location,
          dealType,
          minAmount: parseFloat(minAmount),
          maxAmount: parseFloat(maxAmount),
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });

      if (error) throw error;

      setPotentialDeals(data.deals || []);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.deals.length} potential deals`,
      });
    } catch (error) {
      console.error('Error searching deals:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for deals",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-4">
        <div>
          <Label>Keywords</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {keywords.map(keyword => (
              <Badge key={keyword} variant="outline">
                {keyword}
                <X
                  className="w-3 h-3 ml-2 cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            placeholder="Type and press Enter to add keywords"
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Amount</Label>
            <Input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min amount"
            />
          </div>
          <div>
            <Label>Max Amount</Label>
            <Input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max amount"
            />
          </div>
        </div>

        <div>
          <Label>Deal Type</Label>
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger>
              <SelectValue placeholder="Select deal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acquisition">Acquisition</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="service">Service Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSearch}
          disabled={isLoading}
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? "Searching..." : "Search Deals"}
        </Button>
      </div>

      {potentialDeals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Potential Deals</h3>
          {potentialDeals.map((deal, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{deal.deal_name}</h4>
                  <p className="text-sm text-gray-500">{deal.company_name}</p>
                  <p className="text-sm text-gray-500">Amount: ${deal.amount?.toLocaleString()}</p>
                  {deal.confidence_score && (
                    <Badge variant="outline" className="mt-2">
                      Confidence: {deal.confidence_score}%
                    </Badge>
                  )}
                </div>
                <Button onClick={() => handleCreateDeal(deal)}>Create Deal</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
