
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/types";

interface MobileValuePropositionProps {
  user: User | null;
  handleNavigate: (path: string) => void;
}

export function MobileValueProposition({ user, handleNavigate }: MobileValuePropositionProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 md:hidden py-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          AI-Powered
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sales Management
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Close more deals with the help of AI insights and automated workflows
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {user ? (
          <Button
            onClick={() => handleNavigate("/dashboard")}
            className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleNavigate("/auth")}
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                navigate("/auth");
                localStorage.setItem("auth_mode", "login");
              }}
              variant="outline"
              className="w-full py-6 border-indigo-600 text-indigo-600"
            >
              Sign In
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <span className="text-sm">AI-powered sales recommendations</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <span className="text-sm">No credit card required for free plan</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-indigo-600" />
          <span className="text-sm">Team collaboration features</span>
        </div>
      </div>
    </div>
  );
}
