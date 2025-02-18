import { AccountSettings } from "@/components/settings/AccountSettings";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { TeamSettings } from "@/components/settings/TeamSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { MainHeader } from "@/components/layout/MainHeader";

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [defaultView, setDefaultView] = useState("table");

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

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleDefaultViewChange = async (newView: string) => {
    setDefaultView(newView);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
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
            Manage Subscription
          </Button>
        </Link>
      </MainHeader>
      
      <div className="container py-10 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        {user.subscription_status === false && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">You're on the Free Plan</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Upgrade to Pro to unlock all features</p>
            </div>
            <Link to="/subscription">
              <Button>Upgrade to Pro</Button>
            </Link>
          </div>
        )}
        
        <Tabs defaultValue="account" className="space-y-8">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-8">
            <AccountSettings userData={user} />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-8">
            <UserPreferences
              theme={theme}
              defaultView={defaultView}
              onThemeChange={handleThemeChange}
              onDefaultViewChange={handleDefaultViewChange}
            />
          </TabsContent>

          <TabsContent value="custom-fields" className="space-y-8">
            <CustomFieldsManager />
          </TabsContent>

          <TabsContent value="teams" className="space-y-8">
            <TeamSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
