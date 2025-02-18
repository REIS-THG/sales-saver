import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon } from "lucide-react";
interface UserPreferencesProps {
  theme: string;
  defaultView: string;
  onThemeChange: (theme: string) => Promise<void>;
  onDefaultViewChange: (view: string) => Promise<void>;
}
export function UserPreferences({
  theme,
  defaultView,
  onThemeChange,
  onDefaultViewChange
}: UserPreferencesProps) {
  return <Card className="transition-colors">
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Theme</Label>
            <div className="text-sm text-muted-foreground">
              Choose between light and dark mode
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-orange-500" />
            <Switch checked={theme === "dark"} onCheckedChange={checked => onThemeChange(checked ? "dark" : "light")} />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        
      </CardContent>
    </Card>;
}