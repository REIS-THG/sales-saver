
import { startTransition, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowRight, 
  BarChart3, 
  BrainCircuit, 
  Users2, 
  Rocket, 
  ShieldCheck, 
  Zap,
  CheckCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ValueProposition } from "@/components/home/ValueProposition";
import { FeatureCard } from "@/components/home/FeatureCard";
import { TestimonialCard } from "@/components/home/TestimonialCard";

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
        {/* Value Proposition Section */}
        <ValueProposition 
          user={user}
          handleNavigate={handleNavigate}
          navigate={navigate}
          isMobile={isMobile}
        />

        {/* Features Grid - Enhanced with Screenshots/Illustrations */}
        <div className="mt-16 sm:mt-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Powerful Features to <span className="text-indigo-600">Transform Your Sales Process</span>
          </h2>
          
          <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-8">
            <FeatureCard 
              icon={<BrainCircuit className="h-5 w-5 sm:h-7 sm:w-7 text-indigo-600 dark:text-indigo-400" />}
              title="AI-Powered Insights"
              description="Get intelligent recommendations and predictive analytics to optimize your sales strategy."
              imageSrc="/placeholder.svg"
              imageAlt="AI Insights Dashboard"
              bgColor="bg-indigo-100 dark:bg-indigo-900"
            />
            
            <FeatureCard 
              icon={<Zap className="h-5 w-5 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400" />}
              title="Smart Deal Tracking"
              description="Never miss a follow-up with automated deal tracking and intelligent reminders."
              imageSrc="/placeholder.svg"
              imageAlt="Deal Tracking Interface"
              bgColor="bg-purple-100 dark:bg-purple-900"
            />
            
            <FeatureCard 
              icon={<Users2 className="h-5 w-5 sm:h-7 sm:w-7 text-pink-600 dark:text-pink-400" />}
              title="Team Collaboration"
              description="Work seamlessly with your team, share insights, and boost productivity together."
              imageSrc="/placeholder.svg"
              imageAlt="Team Collaboration"
              bgColor="bg-pink-100 dark:bg-pink-900"
            />
          </div>
        </div>

        {/* Benefits Section - Improved Layout */}
        <div className="max-w-5xl mx-auto py-12 sm:py-20 space-y-8 sm:space-y-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10">
            Why Choose <span className="text-indigo-600">Sales Saver</span>?
          </h2>
          
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-3 items-center text-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Data-Driven Decisions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Make informed decisions with real-time insights</p>
            </div>
            
            <div className="flex flex-col gap-3 items-center text-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Boost Productivity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automate repetitive tasks and focus on closing deals</p>
            </div>
            
            <div className="flex flex-col gap-3 items-center text-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Enterprise Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your data is protected with enterprise-grade security</p>
            </div>
            
            <div className="flex flex-col gap-3 items-center text-center p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold">Scale Your Team</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Easily add team members as your business grows</p>
            </div>
          </div>
        </div>

        {/* Testimonials Section - New */}
        <div className="py-12 sm:py-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl my-8 sm:my-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Trusted by <span className="text-indigo-600">Sales Teams</span> Everywhere
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 px-4 sm:px-10 max-w-6xl mx-auto">
            <TestimonialCard
              quote="Sales Saver has transformed how our team tracks and closes deals. The AI insights are a game-changer."
              author="Sarah Johnson"
              position="Sales Director, TechCorp"
              rating={5}
            />
            
            <TestimonialCard
              quote="We've increased our close rate by 37% since implementing Sales Saver. The analytics and team collaboration features are outstanding."
              author="Michael Chen"
              position="VP of Sales, GrowthIQ"
              rating={5}
            />
            
            <TestimonialCard
              quote="The predictive analytics help us focus on the right leads. Sales Saver has become an essential tool for our entire team."
              author="Emma Rodriguez"
              position="Sales Manager, InnovateX"
              rating={4}
            />
          </div>
        </div>

        {/* CTA Section - Enhanced */}
        {!user && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                Ready to Transform Your Sales Process?
              </h2>
              <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of sales teams already using Sales Saver to close more deals and make data-driven decisions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Button
                  onClick={() => handleNavigate("/auth")}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 text-base sm:text-lg font-semibold px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth");
                    localStorage.setItem("auth_mode", "signup");
                  }}
                  className="bg-indigo-800 text-white hover:bg-indigo-900 text-base sm:text-lg font-semibold px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm sm:text-base">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm sm:text-base">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm sm:text-base">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="max-w-3xl mx-auto p-8 sm:p-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                Welcome Back!
              </h2>
              <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-10">
                Continue working with your sales data and insights.
              </p>
              <Button
                onClick={() => handleNavigate("/dashboard")}
                className="bg-white text-indigo-600 hover:bg-indigo-50 text-base sm:text-lg font-semibold px-8 py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer - New */}
        <footer className="mt-12 pb-10 text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Sales Saver
                </h3>
                <p>Transform your sales process with AI-powered insights</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-left">
                <div>
                  <h4 className="font-semibold mb-2">Product</h4>
                  <ul className="space-y-1">
                    <li>Features</li>
                    <li>Pricing</li>
                    <li>Testimonials</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Company</h4>
                  <ul className="space-y-1">
                    <li>About</li>
                    <li>Contact</li>
                    <li>Careers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Resources</h4>
                  <ul className="space-y-1">
                    <li>Blog</li>
                    <li>Documentation</li>
                    <li>Support</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Legal</h4>
                  <ul className="space-y-1">
                    <li>Privacy</li>
                    <li>Terms</li>
                    <li>Security</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="pt-6 text-xs">
              <p>© {new Date().getFullYear()} Sales Saver. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
