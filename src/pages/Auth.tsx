
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length * 20;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        if (!Object.values(passwordStrength).every(Boolean)) {
          setError("Please meet all password requirements");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              prefersDarkMode: false,
            }
          }
        });
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      setResetEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => navigate("/")}
              aria-label="Go back to home page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
          </div>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Enter your details to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password Strength</Label>
                  <span className="text-sm text-gray-500">{passwordStrengthScore}%</span>
                </div>
                <Progress value={passwordStrengthScore} className="h-2" />
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className={passwordStrength.length ? "text-green-600" : ""}>
                    ✓ At least 8 characters
                  </li>
                  <li className={passwordStrength.uppercase ? "text-green-600" : ""}>
                    ✓ At least one uppercase letter
                  </li>
                  <li className={passwordStrength.lowercase ? "text-green-600" : ""}>
                    ✓ At least one lowercase letter
                  </li>
                  <li className={passwordStrength.number ? "text-green-600" : ""}>
                    ✓ At least one number
                  </li>
                  <li className={passwordStrength.special ? "text-green-600" : ""}>
                    ✓ At least one special character
                  </li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  aria-label="Remember me"
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              {isLogin && (
                <Sheet open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm"
                    >
                      Forgot password?
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Reset Password</SheetTitle>
                      <SheetDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {resetEmailSent ? (
                        <Alert>
                          <AlertDescription>
                            Password reset email sent! Please check your inbox.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="Enter your email"
                              aria-label="Email for password reset"
                            />
                          </div>
                          <Button
                            onClick={handleForgotPassword}
                            disabled={loading || !resetEmail}
                            className="w-full"
                          >
                            {loading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Loading..."
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
