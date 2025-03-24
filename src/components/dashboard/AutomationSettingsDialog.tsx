
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/types";

interface AutomationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: User | null;
}

export function AutomationSettingsDialog({ 
  open, 
  onOpenChange,
  userData 
}: AutomationSettingsDialogProps) {
  const [timeDecay, setTimeDecay] = useState(userData?.deal_automation_settings?.timeDecayRate || 5);
  const [activityBoost, setActivityBoost] = useState(userData?.deal_automation_settings?.activityBoostRate || 10);
  const [enableTimeDecay, setEnableTimeDecay] = useState(userData?.deal_automation_settings?.enableTimeDecay ?? true);
  const [enableActivityBoost, setEnableActivityBoost] = useState(userData?.deal_automation_settings?.enableActivityBoost ?? true);
  const [enableAutoStatus, setEnableAutoStatus] = useState(userData?.deal_automation_settings?.enableAutoStatusChange ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Save settings to user profile
  const saveSettings = async () => {
    if (!userData) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          deal_automation_settings: {
            enableTimeDecay,
            timeDecayRate: timeDecay,
            enableActivityBoost,
            activityBoostRate: activityBoost,
            enableAutoStatusChange: enableAutoStatus
          }
        })
        .eq('user_id', userData.user_id);

      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your automation settings have been updated"
      });
    } catch (error) {
      console.error('Error saving automation settings:', error);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "Please try again later"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deal Automation Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="timeDecay">Time Decay</Label>
              <Switch 
                id="timeDecay" 
                checked={enableTimeDecay} 
                onCheckedChange={setEnableTimeDecay} 
              />
            </div>
            {enableTimeDecay && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Gradually reduce deal health score when there's no activity (points per week)
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    disabled={!enableTimeDecay}
                    value={[timeDecay]}
                    onValueChange={(value) => setTimeDecay(value[0])}
                    max={20}
                    step={1}
                  />
                  <span className="w-12 text-center">{timeDecay}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="activityBoost">Activity Boost</Label>
              <Switch 
                id="activityBoost" 
                checked={enableActivityBoost} 
                onCheckedChange={setEnableActivityBoost} 
              />
            </div>
            {enableActivityBoost && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Increase deal health score when new notes are added (points per note)
                </p>
                <div className="flex items-center space-x-4">
                  <Slider
                    disabled={!enableActivityBoost}
                    value={[activityBoost]}
                    onValueChange={(value) => setActivityBoost(value[0])}
                    max={25}
                    step={1}
                  />
                  <span className="w-12 text-center">{activityBoost}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoStatus">Auto-Status Change</Label>
              <p className="text-sm text-gray-500">
                Automatically suggest status changes based on health score
              </p>
            </div>
            <Switch 
              id="autoStatus" 
              checked={enableAutoStatus} 
              onCheckedChange={setEnableAutoStatus} 
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
