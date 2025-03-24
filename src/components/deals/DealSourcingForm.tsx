
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Search, X, Plus, Globe, Building2, Binary, FileText, AlertTriangle, Loader2, ArrowRight, Clock, CheckCircle2, Info } from "lucide-react";
import type { Deal, DealSourceConfig, SourceType } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtractionProgress } from "@/types/custom-field";
import { SubscriptionStatus } from "@/types/types";

interface PotentialDeal extends Omit<Deal, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  confidence_score?: number;
  source_url?: string;
  matched_keywords?: string[];
  relevance_score?: number;
  health_score: number;
  custom_fields: Record<string, any>;
}

interface DealSourcingFormProps {
  subscriptionTier: SubscriptionStatus;
}

export function DealSourcingForm({ subscriptionTier }: DealSourcingFormProps) {
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
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(3); // Default batch size
  const [enableBatchProcessing, setEnableBatchProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    current: 0,
    total: 0,
    status: 'idle'
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast: toastHook } = useToast();

  // Maximum deals per source based on subscription
  const MAX_DEALS_PER_SOURCE = subscriptionTier === 'pro' ? 10 : 3;

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
      toastHook({
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
      
      try {
        new URL(newSourceUrl.trim());
        setSourceUrls([...sourceUrls, newSourceUrl.trim()]);
        setNewSourceUrl('');
      } catch (error) {
        toast.error("Please enter a valid URL including http:// or https://");
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

      toast.success("Deal created successfully");

      setPotentialDeals(prev => prev.filter(d => d.deal_name !== deal.deal_name));
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error("Failed to create deal");
    }
  };

  const handleSaveConfig = async () => {
    try {
      if (!keywords.length || !sourceUrls.length) {
        toast.error("Please add at least one keyword and source URL");
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

      toast.success("Configuration saved successfully");

      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error("Failed to save configuration");
    }
  };

  const updateProgress = (status: ExtractionProgress['status'], current: number, total: number, message?: string, error?: string) => {
    setExtractionProgress({
      status,
      current,
      total,
      message,
      error
    });
  };

  const processWebsiteScraping = async (url: string) => {
    try {
      updateProgress('scraping', currentSourceIndex + 1, sourceUrls.length, `Scraping ${url}`);

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
      
      updateProgress('analyzing', currentSourceIndex + 1, sourceUrls.length, `Analyzing content from ${url}`);
      
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
      
      // Limit the number of deals based on subscription
      const combinedDeals = [...data.deals, ...aiResponse.data.deals];
      const limitedDeals = combinedDeals.slice(0, MAX_DEALS_PER_SOURCE);
      
      const enhancedDeals = limitedDeals.map(deal => ({
        ...deal,
        health_score: 50,
        custom_fields: {},
      }));
      
      return enhancedDeals;
    } catch (e) {
      console.error('Error in website scraping for URL:', url, e);
      updateProgress('error', currentSourceIndex + 1, sourceUrls.length, undefined, `Failed to process ${url}: ${e.message}`);
      return [];
    }
  };

  const processMarketplaceSource = async (url: string) => {
    updateProgress('processing', currentSourceIndex + 1, sourceUrls.length, `Processing marketplace data from ${url}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const deals: PotentialDeal[] = [];
    const numDeals = Math.min(Math.floor(Math.random() * 3) + 1, MAX_DEALS_PER_SOURCE);
    
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
        health_score: 50,
        custom_fields: {},
      });
    }
    
    return deals;
  };

  const processAPISource = async (url: string) => {
    updateProgress('processing', currentSourceIndex + 1, sourceUrls.length, `Processing API data from ${url}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const deals: PotentialDeal[] = [];
    const numDeals = Math.min(Math.floor(Math.random() * 2) + 1, MAX_DEALS_PER_SOURCE);
    
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
        health_score: 50,
        custom_fields: {},
      });
    }
    
    return deals;
  };

  const processManualSource = async () => {
    updateProgress('processing', currentSourceIndex + 1, sourceUrls.length, `Processing manual input`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deals: PotentialDeal[] = [];
    const numDeals = Math.min(Math.floor(Math.random() * 2) + 1, MAX_DEALS_PER_SOURCE);
    
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
        health_score: 50,
        custom_fields: {},
      });
    }
    
    return deals;
  };

  const handleSearch = async () => {
    if (!keywords.length || !sourceUrls.length) {
      toast.error("Please add at least one keyword and source URL");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setPotentialDeals([]);
    setCurrentSourceIndex(0);
    
    // Create a new AbortController for this search operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const allDeals: PotentialDeal[] = [];
      
      // Calculate the total number of sources to process
      const totalSources = sourceUrls.length;
      updateProgress('scraping', 0, totalSources, 'Starting extraction process');
      
      // Determine how many sources to process based on subscription and settings
      const sourcesToProcess = subscriptionTier === 'pro' || !enableBatchProcessing 
        ? sourceUrls 
        : sourceUrls.slice(0, batchSize);
      
      for (let i = 0; i < sourcesToProcess.length; i++) {
        // Check if the operation was aborted
        if (signal.aborted) {
          break;
        }
        
        setCurrentSourceIndex(i);
        const url = sourcesToProcess[i];
        
        let deals: PotentialDeal[] = [];
        
        try {
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
        } catch (error) {
          console.error(`Error processing source ${url}:`, error);
          toast.error(`Failed to process ${url}: ${error.message}`);
          // Continue with other sources even if one fails
        }
      }
      
      updateProgress('complete', totalSources, totalSources, 'Extraction completed');
      
      if (allDeals.length === 0) {
        setErrorMessage("No potential deals found. Try different keywords or sources.");
      } else {
        setPotentialDeals(allDeals);
        
        toast.success(`Found ${allDeals.length} potential deals`);
      }
    } catch (error) {
      console.error('Error searching deals:', error);
      setErrorMessage("An error occurred during the search. Please try again.");
      toast.error("Failed to search for deals");
      updateProgress('error', 0, sourceUrls.length, undefined, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      updateProgress('idle', 0, 0, undefined);
      setIsLoading(false);
      toast.info("Extraction process canceled");
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

  const getProgressStatusIcon = () => {
    switch (extractionProgress.status) {
      case 'idle':
        return null;
      case 'scraping':
        return <Globe className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />;
      case 'processing':
        return <ArrowRight className="w-4 h-4 animate-pulse text-orange-500" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderProgressBar = () => {
    if (extractionProgress.status === 'idle') return null;
    
    const progressValue = extractionProgress.total > 0 
      ? Math.round((extractionProgress.current / extractionProgress.total) * 100) 
      : 0;
    
    return (
      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getProgressStatusIcon()}
            <span className="text-sm font-medium">
              {extractionProgress.status === 'error' ? 'Error' : 
               extractionProgress.status === 'complete' ? 'Complete' : 
               `Processing source ${extractionProgress.current} of ${extractionProgress.total}`}
            </span>
          </div>
          <span className="text-sm font-medium">{progressValue}%</span>
        </div>
        <Progress value={progressValue} className="w-full" />
        {extractionProgress.message && (
          <p className="text-xs text-gray-500">{extractionProgress.message}</p>
        )}
        {extractionProgress.error && (
          <p className="text-xs text-red-500">{extractionProgress.error}</p>
        )}
      </div>
    );
  };

  // Pro feature display helper
  const ProFeatureBadge = () => (
    <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-300">
      <Lock className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  );

  return (
    <div className="space-y-6 py-6">
      <Toaster />
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            {subscriptionTier === 'pro' && (
              <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-batch">Enable Batch Processing</Label>
                  <Switch 
                    id="enable-batch" 
                    checked={enableBatchProcessing}
                    onCheckedChange={setEnableBatchProcessing}
                    disabled={isLoading}
                  />
                </div>
                
                {enableBatchProcessing && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="batch-size">Batch Size (sources per run)</Label>
                    <Input 
                      id="batch-size"
                      type="number"
                      min={1}
                      max={10}
                      value={batchSize}
                      onChange={(e) => setBatchSize(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            )}

            {renderProgressBar()}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              {!isLoading ? (
                <Button 
                  className="flex-1" 
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Deals
                </Button>
              ) : (
                <Button 
                  className="flex-1" 
                  variant="destructive"
                  onClick={handleCancelExtraction}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Extraction
                </Button>
              )}
              
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
                          toast.error("Failed to update configuration");
                        } else {
                          toast.success("Configuration updated");
                          fetchConfigs();
                        }
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
                          toast.error("Failed to delete configuration");
                        } else {
                          toast.success("Configuration deleted");
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Potential Deals ({potentialDeals.length})</h3>
            {subscriptionTier !== 'pro' && (
              <div className="flex items-center">
                <Info className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-xs text-gray-500">Limited to {MAX_DEALS_PER_SOURCE} deals per source</span>
              </div>
            )}
          </div>
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
