
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Palette, Language, Layout } from "lucide-react";

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
  const { toast } = useToast();

  const handleSavePreferences = () => {
    onThemeChange(localTheme);
    onDefaultViewChange(localDefaultView);
    onLanguageChange(localLanguage);
    
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated",
    });
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
            <Language className="h-5 w-5 text-gray-500" />
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

        <Button onClick={handleSavePreferences}>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

export default UserPreferences;
