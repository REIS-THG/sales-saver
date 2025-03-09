
import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { MainHeader } from "@/components/layout/MainHeader";
import { useTranslation } from "react-i18next";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { TeamSettings } from "@/components/settings/TeamSettings";
import "@/i18n/config";

const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="h-[200px] bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
  </div>
);

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");

  // Memoize theme initialization to prevent unnecessary recalculations
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [defaultView, setDefaultView] = useState("table");
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [isUpdating, setIsUpdating] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Theme management with performance optimization - wrapped with Promise to match expected type
  const handleThemeChange = useCallback(async (newTheme: string): Promise<void> => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    return Promise.resolve();
  }, []);

  // Default view management - wrapped with Promise to match expected type
  const handleDefaultViewChange = useCallback(async (newView: string): Promise<void> => {
    setDefaultView(newView);
    return Promise.resolve();
  }, []);

  // Language management with performance optimization - wrapped with Promise to match expected type
  const handleLanguageChange = useCallback(async (newLanguage: string): Promise<void> => {
    setLanguage(newLanguage);
    if (i18n.isInitialized) {
      i18n.changeLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
    return Promise.resolve();
  }, [i18n]);

  if (authLoading) {
    return <ReportsLoadingState />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <MainHeader onSignOut={() => navigate("/auth")} userData={user}>
          <Link to="/subscription">
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              {t('subscription.manage')}
            </Button>
          </Link>
        </MainHeader>
        
        <div className="container py-10 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          </div>
          
          {user.subscription_status === 'free' && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4 mb-8 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">{t('subscription.freePlan')}</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">{t('subscription.upgradePrompt')}</p>
              </div>
              <Link to="/subscription">
                <Button>{t('subscription.upgradeToPro')}</Button>
              </Link>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList>
              <TabsTrigger value="account">{t('settings.tabs.account')}</TabsTrigger>
              <TabsTrigger value="preferences">{t('settings.tabs.preferences')}</TabsTrigger>
              <TabsTrigger value="custom-fields">{t('settings.tabs.customFields')}</TabsTrigger>
              <TabsTrigger value="teams">{t('settings.tabs.teams')}</TabsTrigger>
            </TabsList>

            <ErrorBoundary>
              {activeTab === "account" && (
                <TabsContent value="account" className="space-y-8">
                  <AccountSettings userData={user} />
                </TabsContent>
              )}

              {activeTab === "preferences" && (
                <TabsContent value="preferences" className="space-y-8">
                  <UserPreferences
                    theme={theme}
                    defaultView={defaultView}
                    language={language}
                    onThemeChange={handleThemeChange}
                    onDefaultViewChange={handleDefaultViewChange}
                    onLanguageChange={handleLanguageChange}
                    isLoading={isUpdating}
                  />
                </TabsContent>
              )}

              {activeTab === "custom-fields" && (
                <TabsContent value="custom-fields" className="space-y-8">
                  <CustomFieldsManager />
                </TabsContent>
              )}

              {activeTab === "teams" && (
                <TabsContent value="teams" className="space-y-8">
                  <TeamSettings />
                </TabsContent>
              )}
            </ErrorBoundary>
          </Tabs>
        </div>
      </ErrorBoundary>
    </div>
  );
}
