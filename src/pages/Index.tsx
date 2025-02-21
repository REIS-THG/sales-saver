import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "Industry-standard security with password strength validation and rate limiting",
      badge: "Enterprise Ready"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description: "Get intelligent analysis of your deals with our Deal Genius feature",
      badge: "New"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Advanced Reporting",
      description: "Generate detailed reports and export them to your preferred format",
      badge: "Popular"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/c5ee71fb-3a16-419d-ac19-2f319771e7b0.png" 
                alt="Sales Saver Logo" 
                className="h-32 w-auto animate-fade-in"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:text-6xl animate-fade-in">
              Maximize Your Sales Potential
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto animate-fade-in">
              Transform your sales process with AI-powered insights and efficient deal management. 
              Join industry leaders who trust Sales Saver to drive their success.
            </p>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-base group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-base border-2"
            >
              Sign In
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-transparent bg-white/60 backdrop-blur-sm hover:bg-white animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 animate-fade-in">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm">
                  <div className="text-indigo-600 font-semibold text-2xl">99.9%</div>
                  <div className="text-sm text-gray-600 mt-1">Uptime</div>
                </div>
                <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm">
                  <div className="text-indigo-600 font-semibold text-2xl">24/7</div>
                  <div className="text-sm text-gray-600 mt-1">Support</div>
                </div>
                <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm">
                  <div className="text-indigo-600 font-semibold text-2xl">GDPR</div>
                  <div className="text-sm text-gray-600 mt-1">Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
