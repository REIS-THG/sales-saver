
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Palette, Languages, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserPreferencesProps {
  theme: string;
  defaultView: string;
  language: string;
  onThemeChange: (theme: string) => void;
  onDefaultViewChange: (view: string) => void;
  onLanguageChange: (language: string) => void;
}

export function UserPreferences({
  theme,
  defaultView,
  language,
  onThemeChange,
  onDefaultViewChange,
  onLanguageChange,
}: UserPreferencesProps) {
  const [localTheme, setLocalTheme] = useState(theme);
  const [localDefaultView, setLocalDefaultView] = useState(defaultView);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update local state when props change
    setLocalTheme(theme);
    setLocalDefaultView(defaultView);
    setLocalLanguage(language);
  }, [theme, defaultView, language]);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Fix: Ensure we're updating the correct user record with consistent field names
      const { error } = await supabase
        .from("users")
        .update({
          theme: localTheme,
          default_deal_view: localDefaultView,
          preferred_language: localLanguage,
        })
        .eq("user_id", userData.user.id);

      if (error) throw error;

      // Update parent component state
      onThemeChange(localTheme);
      onDefaultViewChange(localDefaultView);
      onLanguageChange(localLanguage);
      
      // Apply theme change immediately
      if (localTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (localTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save preferences: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-gray-500" />
            <Label htmlFor="theme">Theme</Label>
          </div>
          <RadioGroup
            value={localTheme}
            onValueChange={setLocalTheme}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex items-center">
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex items-center">
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system">System</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Layout className="h-5 w-5 text-gray-500" />
            <Label htmlFor="default-view">Default Deal View</Label>
          </div>
          <Select
            value={localDefaultView}
            onValueChange={setLocalDefaultView}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kanban">Kanban</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Languages className="h-5 w-5 text-gray-500" />
            <Label htmlFor="language">Language</Label>
          </div>
          <Select value={localLanguage} onValueChange={setLocalLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSavePreferences} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserPreferences;
