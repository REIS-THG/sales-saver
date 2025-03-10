
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Search, X, Plus, Globe, Building2, Binary, FileText, AlertTriangle } from "lucide-react";
import type { Deal, DealSourceConfig, SourceType } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PotentialDeal extends Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  confidence_score?: number;
  source_url?: string;
  matched_keywords?: string[];
  relevance_score?: number;
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
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      
      // Cast both source_type and source_filters when mapping
      setConfigs(configs?.map(config => ({
        ...config,
        source_type: config.source_type as SourceType,
        source_filters: config.source_filters ? JSON.parse(JSON.stringify(config.source_filters)) : {
          industry: [],
          minRevenue: undefined,
          maxRevenue: undefined,
          location: [],
          dealTypes: [],
          excludeKeywords: []
        }
      })) || []);
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
      
      // Basic URL validation
      try {
        new URL(newSourceUrl.trim());
        setSourceUrls([...sourceUrls, newSourceUrl.trim()]);
        setNewSourceUrl('');
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
        });
      }
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
      if (!keywords.length || !sourceUrls.length) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please add at least one keyword and source URL",
        });
        return;
      }
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData.user?.id) {
        throw new Error('User not authenticated');
      }

      const newConfig = {
        name: `${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)} Config ${configs.length + 1}`,
        description: `Configuration for ${sourceType} sourcing with keywords: ${keywords.join(', ')}`,
        source_type: sourceType,
        source_urls: sourceUrls,
        source_keywords: keywords,
        source_filters: {
          industry: [],
          minRevenue: undefined,
          maxRevenue: undefined,
          location: [],
          dealTypes: [],
          excludeKeywords
        },
        is_active: true,
        user_id: userData.user.id
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

  const processWebsiteScraping = async (url: string) => {
    try {
      // Call the website scraping edge function
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: {
          url,
          keywords,
          excludeKeywords,
        },
      });

      if (error) throw error;
      
      if (!data.success) {
        console.log('Scraping unsuccessful for URL:', url, data.message);
        return [];
      }
      
      console.log('Scraped data:', data);
      
      // Process the scraped data with AI
      const aiResponse = await supabase.functions.invoke('ai-deal-extraction', {
        body: {
          metadata: data.metadata,
          sourceType,
          keywords
        }
      });
      
      if (!aiResponse.data.success) {
        throw new Error('AI processing failed');
      }
      
      // Combine the direct scrape results with AI-enhanced results
      return [...data.deals, ...aiResponse.data.deals];
    } catch (e) {
      console.error('Error in website scraping for URL:', url, e);
      return [];
    }
  };

  const processMarketplaceSource = async (url: string) => {
    // Simulate marketplace API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock marketplace results
    const deals: PotentialDeal[] = [];
    const numDeals = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numDeals; i++) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      deals.push({
        deal_name: `${randomKeyword} Marketplace Opportunity ${i + 1}`,
        company_name: `${randomKeyword} Ventures`,
        amount: Math.floor(Math.random() * 50000) + 10000,
        status: 'open',
        company_url: url,
        contact_email: `contact@${randomKeyword.toLowerCase().replace(/\s+/g, '')}ventures.com`,
        notes: `Marketplace opportunity found with keyword: ${randomKeyword}`,
        confidence_score: Math.floor(Math.random() * 30) + 70,
        source_url: url,
        matched_keywords: [randomKeyword],
      });
    }
    
    return deals;
  };

  const processAPISource = async (url: string) => {
    // Simulate API integration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock API results
    const deals: PotentialDeal[] = [];
    const numDeals = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numDeals; i++) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      deals.push({
        deal_name: `${randomKeyword} API Integration ${i + 1}`,
        company_name: `${randomKeyword} API Systems`,
        amount: Math.floor(Math.random() * 100000) + 50000,
        status: 'open',
        company_url: url,
        contact_email: `api@${randomKeyword.toLowerCase().replace(/\s+/g, '')}systems.com`,
        notes: `API integration opportunity with keyword: ${randomKeyword}`,
        confidence_score: Math.floor(Math.random() * 20) + 80,
        source_url: url,
        matched_keywords: [randomKeyword],
      });
    }
    
    return deals;
  };

  const processManualSource = async () => {
    // For manual sources, we'll just use the keywords to generate potential deals
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deals: PotentialDeal[] = [];
    const numDeals = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numDeals; i++) {
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      deals.push({
        deal_name: `${randomKeyword} Manual Lead ${i + 1}`,
        company_name: `${randomKeyword} Solutions`,
        amount: Math.floor(Math.random() * 75000) + 25000,
        status: 'open',
        company_url: 'https://example.com',
        contact_email: `contact@${randomKeyword.toLowerCase().replace(/\s+/g, '')}solutions.com`,
        notes: `Manual lead entry with keyword: ${randomKeyword}`,
        confidence_score: Math.floor(Math.random() * 40) + 60,
        source_url: 'https://example.com',
        matched_keywords: [randomKeyword],
      });
    }
    
    return deals;
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
    setErrorMessage(null);
    setPotentialDeals([]);
    setSearchProgress(0);
    setCurrentSourceIndex(0);
    
    try {
      const allDeals: PotentialDeal[] = [];
      
      for (let i = 0; i < sourceUrls.length; i++) {
        setCurrentSourceIndex(i);
        const url = sourceUrls[i];
        
        let deals: PotentialDeal[] = [];
        
        switch (sourceType) {
          case 'website':
            deals = await processWebsiteScraping(url);
            break;
          case 'marketplace':
            deals = await processMarketplaceSource(url);
            break;
          case 'api':
            deals = await processAPISource(url);
            break;
          case 'manual':
            deals = await processManualSource();
            break;
        }
        
        allDeals.push(...deals);
        
        // Update progress
        setSearchProgress(((i + 1) / sourceUrls.length) * 100);
      }
      
      if (allDeals.length === 0) {
        setErrorMessage("No potential deals found. Try different keywords or sources.");
      } else {
        setPotentialDeals(allDeals);
        
        toast({
          title: "Search Complete",
          description: `Found ${allDeals.length} potential deals`,
        });
      }
    } catch (error) {
      console.error('Error searching deals:', error);
      setErrorMessage("An error occurred during the search. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for deals",
      });
    } finally {
      setIsLoading(false);
      setSearchProgress(100);
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
                placeholder={`Enter ${sourceType === 'manual' ? 'source identifier' : 'URL'} and press Enter`}
              />
              {sourceType === 'website' && (
                <p className="text-xs text-gray-500 mt-1">
                  Enter full URLs including https://
                </p>
              )}
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

            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Processing source {currentSourceIndex + 1} of {sourceUrls.length}
                  </span>
                  <span className="text-sm font-medium">{Math.round(searchProgress)}%</span>
                </div>
                <Progress value={searchProgress} className="w-full" />
              </div>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button 
                className="flex-1" 
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Deals
                  </>
                )}
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
            {configs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">No saved configurations</h3>
                <p className="mt-1 text-sm">Create and save a search configuration to see it here.</p>
              </div>
            ) : (
              configs.map((config) => (
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
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {potentialDeals.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Potential Deals ({potentialDeals.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {potentialDeals.map((deal, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="font-medium">{deal.deal_name}</h4>
                    <p className="text-sm text-gray-500">{deal.company_name}</p>
                    <p className="text-sm text-gray-500">Amount: ${deal.amount?.toLocaleString()}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {deal.matched_keywords?.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {deal.confidence_score && (
                        <Badge variant={deal.confidence_score > 80 ? "default" : "outline"} className="mt-2">
                          Confidence: {deal.confidence_score}%
                        </Badge>
                      )}
                      {deal.relevance_score && (
                        <Badge variant="outline" className="mt-2 bg-blue-50">
                          Relevance: {deal.relevance_score}%
                        </Badge>
                      )}
                    </div>
                    
                    {deal.source_url && (
                      <p className="text-xs text-gray-500 mt-2 truncate max-w-[250px]">
                        Source: {deal.source_url}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => handleCreateDeal(deal)}>Create Deal</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
