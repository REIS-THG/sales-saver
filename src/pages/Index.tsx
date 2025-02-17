
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Sales Saver
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Streamline your sales pipeline with AI-powered insights and effective deal management
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-base"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-base"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
