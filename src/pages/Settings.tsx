
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { MainHeader } from "@/components/layout/MainHeader";
import { useTranslation } from "react-i18next";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@/i18n/config";

// Lazy load components
const AccountSettings = lazy(() => import("@/components/settings/AccountSettings"));
const UserPreferences = lazy(() => import("@/components/settings/UserPreferences"));
const CustomFieldsManager = lazy(() => import("@/components/settings/CustomFieldsManager"));
const TeamSettings = lazy(() => import("@/components/settings/TeamSettings"));

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [defaultView, setDefaultView] = useState("table");
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (i18n.isInitialized) {
      i18n.changeLanguage(language);
      localStorage.setItem('language', language);
    }
  }, [language, i18n]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleDefaultViewChange = (newView: string) => {
    setDefaultView(newView);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  if (loading) {
    return <ReportsLoadingState />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
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

          <Suspense fallback={<ReportsLoadingState />}>
            <TabsContent value="account" className="space-y-8">
              {activeTab === "account" && <AccountSettings userData={user} />}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-8">
              {activeTab === "preferences" && (
                <UserPreferences
                  theme={theme}
                  defaultView={defaultView}
                  language={language}
                  onThemeChange={handleThemeChange}
                  onDefaultViewChange={handleDefaultViewChange}
                  onLanguageChange={handleLanguageChange}
                />
              )}
            </TabsContent>

            <TabsContent value="custom-fields" className="space-y-8">
              {activeTab === "custom-fields" && <CustomFieldsManager />}
            </TabsContent>

            <TabsContent value="teams" className="space-y-8">
              {activeTab === "teams" && <TeamSettings />}
            </TabsContent>
          </Suspense>
        </Tabs>
      </div>
    </div>
  );
}
