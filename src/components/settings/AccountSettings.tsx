
import { User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, UserIcon, CreditCard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AccountSettingsProps {
  userData: User | null;
}

export function AccountSettings({ userData }: AccountSettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setIsChangingPassword(false);
      setNewPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account details and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <Label>Full Name</Label>
              <Input value={userData?.full_name || ''} disabled />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <Label>Email</Label>
              <Input value={userData?.email || ''} disabled />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Lock className="h-5 w-5 text-gray-500" />
            <div className="flex-1 space-y-2">
              <Label>Password</Label>
              {isChangingPassword ? (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handlePasswordChange}>Save Password</Button>
                    <Button variant="ghost" onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                  Change Password
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <Label>Subscription & Billing</Label>
              <div className="flex items-center justify-between mt-2">
                <span className="capitalize">{userData?.subscription_status || 'free'}</span>
                <div className="space-x-2">
                  {userData?.subscription_status === 'pro' && (
                    <a href="https://billing.stripe.com/p/login/3cseWi90FfLW98I9AA" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        Manage Billing
                      </Button>
                    </a>
                  )}
                  {userData?.subscription_status === 'free' && (
                    <Link to="/subscription">
                      <Button>Upgrade to Pro</Button>
                    </Link>
                  )}
                </div>
              </div>
              {userData?.subscription_end_date && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires: {new Date(userData.subscription_end_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
