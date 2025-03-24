
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutomationSettingsDialogProps {
  userId: string;
  settings: AutomationSettings;
  onSettingsChange: (settings: AutomationSettings) => void;
}

export interface AutomationSettings {
  enableTimeDecay: boolean;
  timeDecayRate: number;
  enableActivityBoost: boolean;
  activityBoostRate: number;
  enableAutoStatusChange: boolean;
}

export function AutomationSettingsDialog({
  userId,
  settings,
  onSettingsChange,
}: AutomationSettingsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState<AutomationSettings>(settings);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          deal_automation_settings: localSettings
        })
        .eq("user_id", userId);

      if (error) throw error;
      
      onSettingsChange(localSettings);
      toast({
        title: "Settings saved",
        description: "Your automation settings have been updated",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error saving automation settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save automation settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings2 className="h-4 w-4 mr-2" />
          Automation Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deal Health Score Automation</DialogTitle>
          <DialogDescription>
            Configure how deal health scores are automatically updated based on activity and time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="time-decay" className="font-medium">Time Decay</Label>
              <p className="text-sm text-gray-500">Decrease health score over time for inactive deals</p>
            </div>
            <Switch
              id="time-decay"
              checked={localSettings.enableTimeDecay}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, enableTimeDecay: checked})}
            />
          </div>
          
          {localSettings.enableTimeDecay && (
            <div className="pl-2 border-l-2 border-gray-200 ml-2">
              <Label htmlFor="decay-rate" className="mb-1 block">Decay Rate: {localSettings.timeDecayRate}%</Label>
              <Slider
                id="decay-rate"
                min={1}
                max={10}
                step={1}
                value={[localSettings.timeDecayRate]}
                onValueChange={(value) => setLocalSettings({...localSettings, timeDecayRate: value[0]})}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Health score will decrease by this percentage every 7 days without activity
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="activity-boost" className="font-medium">Activity Boost</Label>
              <p className="text-sm text-gray-500">Increase health score when new notes or updates are added</p>
            </div>
            <Switch
              id="activity-boost"
              checked={localSettings.enableActivityBoost}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, enableActivityBoost: checked})}
            />
          </div>
          
          {localSettings.enableActivityBoost && (
            <div className="pl-2 border-l-2 border-gray-200 ml-2">
              <Label htmlFor="boost-rate" className="mb-1 block">Boost Rate: {localSettings.activityBoostRate}%</Label>
              <Slider
                id="boost-rate"
                min={1}
                max={10}
                step={1}
                value={[localSettings.activityBoostRate]}
                onValueChange={(value) => setLocalSettings({...localSettings, activityBoostRate: value[0]})}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Health score will increase by this percentage for each new note or update
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-status" className="font-medium">Auto Status Change</Label>
              <p className="text-sm text-gray-500">Automatically suggest status changes based on health score</p>
            </div>
            <Switch
              id="auto-status"
              checked={localSettings.enableAutoStatusChange}
              onCheckedChange={(checked) => setLocalSettings({...localSettings, enableAutoStatusChange: checked})}
            />
          </div>
          
          {localSettings.enableAutoStatusChange && (
            <div className="pl-2 border-l-2 border-gray-200 ml-2">
              <p className="text-xs text-gray-500">
                System will suggest status changes based on health score thresholds:
                <br />- Below 30%: Suggest marking as "at risk"
                <br />- Below 15%: Suggest marking as "stalled"
                <br />- No activity for 30+ days: Suggest review
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
