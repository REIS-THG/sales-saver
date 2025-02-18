
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useApiError() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthCheck = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
      
    if (authError) {
      console.error('Auth error:', authError);
      navigate("/auth");
      return null;
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.error('No user ID found');
      navigate("/auth");
      return null;
    }

    return userId;
  };

  const handleError = (error: any, message: string) => {
    console.error(`Error: ${message}:`, error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `${message}. Please try again.`,
    });
  };

  const handleSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  return {
    handleAuthCheck,
    handleError,
    handleSuccess,
  };
}
