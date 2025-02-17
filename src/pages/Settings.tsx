import { AccountSettings } from "@/components/settings/AccountSettings";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [defaultView, setDefaultView] = useState("table");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    // Implement theme change logic
  };

  const handleDefaultViewChange = async (newView: string) => {
    setDefaultView(newView);
    // Implement default view change logic
  };

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="account" className="space-y-8">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
