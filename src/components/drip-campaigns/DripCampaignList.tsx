
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, Pause, Settings2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DripCampaign } from "@/types/types";

export function DripCampaignList() {
  const [campaigns, setCampaigns] = useState<DripCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('drip_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure the data matches our DripCampaign interface
      const typedCampaigns = (data || []).map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        user_id: campaign.user_id,
        deal_id: campaign.deal_id,
        status: campaign.status as DripCampaign['status'],
        created_at: campaign.created_at,
        updated_at: campaign.updated_at,
        trigger_type: campaign.trigger_type as DripCampaign['trigger_type'],
        trigger_delay: campaign.trigger_delay
      }));

      setCampaigns(typedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch campaigns",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaign: DripCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('drip_campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      setCampaigns(campaigns.map(c => 
        c.id === campaign.id ? { ...c, status: newStatus as DripCampaign['status'] } : c
      ));

      toast({
        title: "Success",
        description: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully`,
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign status",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drip Campaigns</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No campaigns created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleCampaignStatus(campaign)}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  {campaign.created_at && (
                    <span className="ml-4">
                      Created {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
