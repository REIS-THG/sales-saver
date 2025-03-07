
import React, { useState, Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { UserPreferences } from "@/components/settings/UserPreferences";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

// Lazy load tab components
const AccountSettings = lazy(() => import("@/components/settings/AccountSettings"));
const CustomFieldsManager = lazy(() => import("@/components/settings/CustomFieldsManager"));
const TeamSettings = lazy(() => import("@/components/settings/TeamSettings"));

const TabLoadingFallback = () => (
  <div className="p-4">
    <div className="flex items-center justify-center py-8">
      <Spinner size="lg" />
    </div>
  </div>
);

const Settings = () => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<string>("account");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>
      
      <ErrorBoundary>
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
          <Card className="mb-6">
            <CardContent className="p-0">
              <TabsList className="w-full border-b rounded-t-lg rounded-b-none p-0">
                <TabsTrigger value="account" className="flex-1 rounded-none py-3">
                  {t("settings.tabs.account")}
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex-1 rounded-none py-3">
                  {t("settings.tabs.preferences")}
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="flex-1 rounded-none py-3">
                  {t("settings.tabs.customFields")}
                </TabsTrigger>
                <TabsTrigger value="teams" className="flex-1 rounded-none py-3">
                  {t("settings.tabs.teams")}
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="account" className="mt-0">
            <Suspense fallback={<TabLoadingFallback />}>
              <AccountSettings />
            </Suspense>
          </TabsContent>

          <TabsContent value="preferences" className="mt-0">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="custom-fields" className="mt-0">
            <Suspense fallback={<TabLoadingFallback />}>
              <CustomFieldsManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <Suspense fallback={<TabLoadingFallback />}>
              <TeamSettings />
            </Suspense>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
};

export default Settings;
