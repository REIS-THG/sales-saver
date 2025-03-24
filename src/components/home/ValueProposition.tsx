
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface ValuePropositionProps {
  user: any;
  handleNavigate: (path: string) => void;
  navigate: NavigateFunction;
  isMobile: boolean;
}

export function ValueProposition({ user, handleNavigate, navigate, isMobile }: ValuePropositionProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-10 sm:py-16">
      {/* Visual Element - animated gradient shape */}
      <div className="absolute top-32 right-0 -z-10 w-72 h-72 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      
      {/* Main Heading with Strong Value Proposition */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-center">
        Close More Deals with
        <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
          AI-Powered Sales Intelligence
        </span>
      </h1>
      
      {/* Subheading with clear benefits */}
      <p className="text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center">
        Boost your team's performance by 35%, reduce sales cycle length, and make data-driven decisions with our intelligent sales platform
      </p>
      
      {/* Statistics to build credibility */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-10 mt-8 mb-10">
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600">35%</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Increase in Win Rate</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600">28%</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Shorter Sales Cycles</p>
        </div>
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600">10k+</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Active Users</p>
        </div>
      </div>
      
      {/* CTA Buttons - More prominent */}
      {!user && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={() => {
              navigate("/auth");
              localStorage.setItem("auth_mode", "signup");
            }}
            size={isMobile ? "default" : "lg"}
            className="group relative inline-flex items-center px-6 py-6 sm:px-10 sm:py-8 text-base sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() => handleNavigate("/auth")}
            size={isMobile ? "default" : "lg"}
            className="group relative inline-flex items-center px-6 py-6 sm:px-10 sm:py-8 text-base sm:text-xl bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Sign In
            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
      
      {user && (
        <Button
          onClick={() => handleNavigate("/dashboard")}
          size={isMobile ? "default" : "lg"}
          className="group relative inline-flex items-center px-6 py-6 sm:px-10 sm:py-8 text-base sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mx-auto"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
      
      {/* Social Proof */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">TRUSTED BY COMPANIES WORLDWIDE</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-70">
          <div className="h-6 w-20 bg-gray-400 rounded"></div>
          <div className="h-6 w-20 bg-gray-400 rounded"></div>
          <div className="h-6 w-20 bg-gray-400 rounded"></div>
          <div className="h-6 w-20 bg-gray-400 rounded"></div>
        </div>
      </div>
    </div>
  );
}
