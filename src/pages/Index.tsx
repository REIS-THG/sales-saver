
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
    <Suspense fallback={<ReportsLoadingState />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Your Sales Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your deals, analyze performance, and generate insights
            </p>
          </div>

          <div className="space-y-4">
            {!user ? (
              <Button
                className="w-full max-w-xs mx-auto"
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
    </Suspense>
  );
};

export default Index;
