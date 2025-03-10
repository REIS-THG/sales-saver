
import { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";

// Lazy-load components
const AccountSettings = lazy(() => import("@/components/settings/AccountSettings"));
const UserPreferences = lazy(() => import("@/components/settings/UserPreferences"));
const CustomFieldsManager = lazy(() => import("@/components/settings/CustomFieldsManager"));
const TeamSettings = lazy(() => import("@/components/settings/TeamSettings"));

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [userPreferences, setUserPreferences] = useState({
    theme: "light",
    defaultView: "kanban",
    language: "en"
  });

  useEffect(() => {
    if (user) {
      // Initialize user preferences from user data
      setUserPreferences({
        theme: user.theme || "light",
        defaultView: user.default_deal_view || "kanban",
        language: "en" // Default language, could be stored in user profile
      });
    }
  }, [user]);

  const handleThemeChange = (theme: string) => {
    setUserPreferences(prev => ({ ...prev, theme }));
  };

  const handleDefaultViewChange = (defaultView: string) => {
    setUserPreferences(prev => ({ ...prev, defaultView }));
  };

  const handleLanguageChange = (language: string) => {
    setUserPreferences(prev => ({ ...prev, language }));
  };

  if (isLoading) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="customFields">Custom Fields</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <Suspense fallback={<ReportsLoadingState />}>
            <AccountSettings userData={user} />
          </Suspense>
        </TabsContent>
        <TabsContent value="preferences" className="space-y-4">
          <Suspense fallback={<ReportsLoadingState />}>
            <UserPreferences 
              theme={userPreferences.theme}
              defaultView={userPreferences.defaultView}
              language={userPreferences.language}
              onThemeChange={handleThemeChange}
              onDefaultViewChange={handleDefaultViewChange}
              onLanguageChange={handleLanguageChange}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="customFields" className="space-y-4">
          <Suspense fallback={<ReportsLoadingState />}>
            <CustomFieldsManager />
          </Suspense>
        </TabsContent>
        <TabsContent value="team" className="space-y-4">
          <Suspense fallback={<ReportsLoadingState />}>
            <TeamSettings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
