
import { startTransition, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const handleNavigate = (path: string) => {
    setIsPending(true);
    startTransition(() => {
      navigate(path);
    });
  };

  if (loading || isPending) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Sales Saver: Your Smart Sales Management Solution
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Streamline your sales process, track deals effortlessly, and boost your team's performance with AI-powered insights.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Smart Deal Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">Keep your deals organized and never miss a follow-up.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">Get intelligent recommendations and deal analytics.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">Work together seamlessly with your sales team.</p>
            </div>
          </div>

          <div className="space-y-4">
            {!user ? (
              <Button
                className="w-full max-w-xs mx-auto text-lg py-6"
                onClick={() => handleNavigate("/auth")}
              >
                Get Started
              </Button>
            ) : (
              <div className="space-y-4">
                <Button
                  className="w-full max-w-xs mx-auto"
                  onClick={() => handleNavigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  className="w-full max-w-xs mx-auto"
                  variant="outline"
                  onClick={() => handleNavigate("/reports")}
                >
                  View Reports
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
