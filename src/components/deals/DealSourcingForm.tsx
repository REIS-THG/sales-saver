
import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, Search, X, Plus, Globe, Building2, Binary, FileText } from "lucide-react";
import type { Deal, DealSourceConfig, SourceType } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface PotentialDeal extends Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  confidence_score?: number;
  source_url?: string;
}

export function DealSourcingForm() {
  const [activeConfig, setActiveConfig] = useState<DealSourceConfig | null>(null);
  const [configs, setConfigs] = useState<DealSourceConfig[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('website');
  const [isLoading, setIsLoading] = useState(false);
  const [potentialDeals, setPotentialDeals] = useState<PotentialDeal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data: configs, error } = await supabase
        .from('deal_source_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch source configurations",
      });
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault();
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleAddExcludeKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newExcludeKeyword.trim()) {
      e.preventDefault();
      setExcludeKeywords([...excludeKeywords, newExcludeKeyword.trim()]);
      setNewExcludeKeyword('');
    }
  };

  const handleAddSourceUrl = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSourceUrl.trim()) {
      e.preventDefault();
      setSourceUrls([...sourceUrls, newSourceUrl.trim()]);
      setNewSourceUrl('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const removeExcludeKeyword = (keyword: string) => {
    setExcludeKeywords(excludeKeywords.filter(k => k !== keyword));
  };

  const removeSourceUrl = (url: string) => {
    setSourceUrls(sourceUrls.filter(u => u !== url));
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

  const handleSaveConfig = async () => {
    try {
      const newConfig = {
        name: `Source Config ${configs.length + 1}`,
        description: `Configuration for ${sourceType} sourcing`,
        source_type: sourceType,
        source_urls: sourceUrls,
        source_keywords: keywords,
        source_filters: {
          excludeKeywords,
        },
        is_active: true,
      };

      const { error } = await supabase
        .from('deal_source_configurations')
        .insert([newConfig]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });

      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save configuration",
      });
    }
  };

  const handleSearch = async () => {
    if (!keywords.length || !sourceUrls.length) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please add at least one keyword and source URL",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-deals', {
        body: {
          keywords,
          excludeKeywords,
          sourceUrls,
          sourceType,
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

  const getSourceTypeIcon = (type: SourceType) => {
    switch (type) {
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'marketplace':
        return <Building2 className="w-4 h-4" />;
      case 'api':
        return <Binary className="w-4 h-4" />;
      case 'manual':
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 py-6">
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Search</TabsTrigger>
          <TabsTrigger value="saved">Saved Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Source Type</Label>
              <Select value={sourceType} onValueChange={(value: SourceType) => setSourceType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website Scraping
                    </div>
                  </SelectItem>
                  <SelectItem value="marketplace">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Marketplace
                    </div>
                  </SelectItem>
                  <SelectItem value="api">
                    <div className="flex items-center gap-2">
                      <Binary className="w-4 h-4" />
                      API Integration
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Manual Input
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Source URLs</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {sourceUrls.map(url => (
                  <Badge key={url} variant="outline">
                    {url}
                    <X
                      className="w-3 h-3 ml-2 cursor-pointer"
                      onClick={() => removeSourceUrl(url)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                onKeyDown={handleAddSourceUrl}
                placeholder="Enter URL and press Enter"
              />
            </div>

            <div>
              <Label>Include Keywords</Label>
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
              <Label>Exclude Keywords</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {excludeKeywords.map(keyword => (
                  <Badge key={keyword} variant="outline" className="bg-red-50">
                    {keyword}
                    <X
                      className="w-3 h-3 ml-2 cursor-pointer"
                      onClick={() => removeExcludeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                value={newExcludeKeyword}
                onChange={(e) => setNewExcludeKeyword(e.target.value)}
                onKeyDown={handleAddExcludeKeyword}
                placeholder="Type and press Enter to add exclude keywords"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1" 
                onClick={handleSearch}
                disabled={isLoading}
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Searching..." : "Search Deals"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSaveConfig}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="space-y-4">
            {configs.map((config) => (
              <Card key={config.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSourceTypeIcon(config.source_type)}
                    <h3 className="font-medium">{config.name}</h3>
                  </div>
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={async (checked) => {
                      const { error } = await supabase
                        .from('deal_source_configurations')
                        .update({ is_active: checked })
                        .eq('id', config.id);

                      if (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to update configuration",
                        });
                      }
                      fetchConfigs();
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {config.source_keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {config.source_urls.map((url, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50">
                        {url}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveConfig(config);
                      setSourceType(config.source_type);
                      setSourceUrls(config.source_urls);
                      setKeywords(config.source_keywords);
                      setExcludeKeywords(config.source_filters.excludeKeywords || []);
                    }}
                  >
                    Load
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('deal_source_configurations')
                        .delete()
                        .eq('id', config.id);

                      if (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to delete configuration",
                        });
                      } else {
                        fetchConfigs();
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
                  {deal.source_url && (
                    <p className="text-sm text-gray-500 mt-2">
                      Source: {deal.source_url}
                    </p>
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
