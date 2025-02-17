
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "Industry-standard security with password strength validation and rate limiting"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get intelligent analysis of your deals with our Deal Genius feature"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Advanced Reporting",
      description: "Generate detailed reports and export them to your preferred format"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Sales Saver
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Streamline your sales pipeline with AI-powered insights and effective deal management. 
            Join thousands of sales professionals making data-driven decisions.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-base group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-6 bg-primary/5 rounded-lg">
            <p className="text-sm text-gray-600">
              🔒 Enterprise-grade security • GDPR Compliant • 24/7 Support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
