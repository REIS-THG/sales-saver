
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import type { User } from "@/types/types";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { CustomFieldsManager } from "@/components/settings/CustomFieldsManager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [defaultView, setDefaultView] = useState("table");
  const [userData, setUserData] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserPreferences();
    fetchUserProfile();
  }, []);

  const fetchUserPreferences = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("theme, default_deal_view")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to fetch user preferences",
        variant: "destructive",
      });
      return;
    }

    if (!userData) {
      const { error: createError } = await supabase
        .from("users")
        .insert({
          user_id: userId,
          full_name: authData.user?.email?.split('@')[0] || 'User',
          theme: 'light',
          default_deal_view: 'table',
          role: 'sales_rep'
        });

      if (createError) {
        toast({
          title: "Error",
          description: "Failed to create user preferences",
          variant: "destructive",
        });
        return;
      }

      setTheme('light');
      setDefaultView('table');
    } else {
      setTheme(userData.theme || "light");
      setDefaultView(userData.default_deal_view || "table");
    }
  };

  const fetchUserProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: userDataResult, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
      return;
    }

    const billingAddress = typeof userDataResult.billing_address === 'object' 
      ? userDataResult.billing_address as { 
          street?: string;
          city?: string;
          state?: string;
          country?: string;
          postal_code?: string;
        }
      : {};

    const customViews = Array.isArray(userDataResult.custom_views) 
      ? userDataResult.custom_views.map(view => {
          if (typeof view === 'object' && view !== null) {
            return view as Record<string, any>;
          }
          return {} as Record<string, any>;
        })
      : [];

    const userData: User = {
      ...userDataResult,
      role: userDataResult.role as 'sales_rep' | 'manager',
      custom_views: customViews,
      billing_address: billingAddress,
      subscription_status: (userDataResult.subscription_status as 'free' | 'pro' | 'enterprise') || 'free'
    };

    setUserData(userData);
  };

  const updateTheme = async (newTheme: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ theme: newTheme })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update theme preference",
        variant: "destructive",
      });
    } else {
      setTheme(newTheme);
      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    }
  };

  const updateDefaultView = async (newView: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ default_deal_view: newView })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update default view",
        variant: "destructive",
      });
    } else {
      setDefaultView(newView);
      toast({
        title: "Success",
        description: "Default view updated successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <AccountSettings userData={userData} />
          
          <UserPreferences
            theme={theme}
            defaultView={defaultView}
            onThemeChange={updateTheme}
            onDefaultViewChange={updateDefaultView}
          />
          
          <CustomFieldsManager />

          <ConfirmDialog
            title="Update Workspace Settings"
            description="Are you sure you want to update your workspace settings? This may affect how data is displayed across your account."
            onConfirm={async () => {
              const { error } = await supabase
                .from("users")
                .update({
                  theme,
                  default_deal_view: defaultView,
                })
                .eq("user_id", userData?.user_id);

              if (error) {
                toast({
                  title: "Error",
                  description: "Failed to update workspace settings",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Success",
                  description: "Workspace settings updated successfully",
                });
              }
            }}
            triggerButton={
              <Button className="mt-4">
                Save Workspace Settings
              </Button>
            }
            variant="default"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
