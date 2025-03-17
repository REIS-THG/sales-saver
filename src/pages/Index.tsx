
import { startTransition, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, BarChart3, BrainCircuit, Users2, Rocket, ShieldCheck, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const isMobile = useIsMobile();

  const handleNavigate = (path: string) => {
    setIsPending(true);
    startTransition(() => {
      navigate(path);
    });
  };

  if (isLoading || isPending) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full backdrop-blur-sm bg-white/75 dark:bg-gray-900/75 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sales Saver
            </h2>
            <div className="flex space-x-2">
              {user ? (
                <Button
                  onClick={() => handleNavigate("/dashboard")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  size={isMobile ? "sm" : "default"}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleNavigate("/auth")}
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      // This will make the Auth page open in signup mode instead of login
                      localStorage.setItem("auth_mode", "signup");
                    }}
                    size={isMobile ? "sm" : "default"}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-20 sm:pt-24">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 py-10 sm:py-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
            Transform Your Sales Process with
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Insights
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Boost your team's performance, close more deals, and make data-driven decisions
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => handleNavigate("/auth")}
                size={isMobile ? "default" : "lg"}
                className="group relative inline-flex items-center px-5 py-6 sm:px-8 sm:py-8 text-base sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => {
                  navigate("/auth");
                  localStorage.setItem("auth_mode", "signup");
                }}
                size={isMobile ? "default" : "lg"}
                className="group relative inline-flex items-center px-5 py-6 sm:px-8 sm:py-8 text-base sm:text-xl bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
          
          {user && (
            <Button
              onClick={() => handleNavigate("/dashboard")}
              size={isMobile ? "default" : "lg"}
              className="group relative inline-flex items-center px-5 py-6 sm:px-8 sm:py-8 text-base sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-8 sm:py-16">
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg w-fit mb-3 sm:mb-4">
              <BrainCircuit className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Get intelligent recommendations and predictive analytics to optimize your sales strategy.</p>
          </div>
          
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mb-3 sm:mb-4">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Smart Deal Tracking</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Never miss a follow-up with automated deal tracking and intelligent reminders.</p>
          </div>
          
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 md:col-span-1 sm:col-span-2 md:col-auto">
            <div className="p-2 sm:p-3 bg-pink-100 dark:bg-pink-900 rounded-lg w-fit mb-3 sm:mb-4">
              <Users2 className="h-4 w-4 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Work seamlessly with your team, share insights, and boost productivity together.</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto py-8 sm:py-16 space-y-8 sm:space-y-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-12">
            Why Choose Sales Saver?
          </h2>
          
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2">
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900 rounded-lg shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Data-Driven Decisions</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Make informed decisions with comprehensive analytics and real-time insights.</p>
              </div>
            </div>
            
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Boost Productivity</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Automate repetitive tasks and focus on what matters - closing deals.</p>
              </div>
            </div>
            
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900 rounded-lg shrink-0">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Enterprise Security</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Your data is protected with enterprise-grade security and encryption.</p>
              </div>
            </div>
            
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="p-1.5 sm:p-2 bg-rose-100 dark:bg-rose-900 rounded-lg shrink-0">
                <Users2 className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Scale Your Team</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Easily add team members and manage permissions as your business grows.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center py-8 sm:py-16 px-4">
            <div className="max-w-3xl mx-auto p-5 sm:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Ready to Transform Your Sales Process?
              </h2>
              <p className="text-base sm:text-xl text-indigo-100 mb-5 sm:mb-8">
                Join thousands of sales teams already using Sales Saver.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  onClick={() => handleNavigate("/auth")}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth");
                    localStorage.setItem("auth_mode", "signup");
                  }}
                  className="bg-indigo-800 text-white hover:bg-indigo-900 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="text-center py-8 sm:py-16 px-4">
            <div className="max-w-3xl mx-auto p-5 sm:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Welcome Back!
              </h2>
              <p className="text-base sm:text-xl text-indigo-100 mb-5 sm:mb-8">
                Continue working with your sales data and insights.
              </p>
              <Button
                onClick={() => handleNavigate("/dashboard")}
                className="bg-white text-indigo-600 hover:bg-indigo-50 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
