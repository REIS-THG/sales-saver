
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Globe } from "lucide-react";

interface UserPreferencesProps {
  theme: string;
  defaultView: string;
  language: string;
  onThemeChange: (theme: string) => Promise<void>;
  onDefaultViewChange: (view: string) => Promise<void>;
  onLanguageChange: (language: string) => Promise<void>;
}

export function UserPreferences({
  theme,
  defaultView,
  language,
  onThemeChange,
  onDefaultViewChange,
  onLanguageChange
}: UserPreferencesProps) {
  const { t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('preferences.title')}</CardTitle>
        <CardDescription>{t('preferences.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('preferences.theme')}</Label>
            <div className="text-sm text-muted-foreground">
              {t('preferences.themeDescription')}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-orange-500" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => onThemeChange(checked ? "dark" : "light")}
            />
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <Label>{t('preferences.language')}</Label>
          </div>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('preferences.selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {t('preferences.languageDescription')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
