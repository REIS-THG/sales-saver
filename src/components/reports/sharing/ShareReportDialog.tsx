
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share, Copy, Mail, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReportConfiguration } from "@/components/reports/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface ShareReportDialogProps {
  report: ReportConfiguration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareReportDialog({ report, isOpen, onClose }: ShareReportDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [activeTab, setActiveTab] = useState("link");

  // This would be a real URL in production
  const shareUrl = report ? `${window.location.origin}/shared-reports/${report.id}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address",
      });
      return;
    }

    if (!report) return;

    setIsEmailSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsEmailSending(false);
      setEmail("");
      toast({
        title: "Sharing invitation sent",
        description: `An invitation to view "${report.name}" has been sent to ${email}`,
      });
    }, 1000);
  };

  const handleTogglePublic = (value: boolean) => {
    setIsPublic(value);
    toast({
      title: value ? "Report made public" : "Report made private",
      description: value 
        ? "Anyone with the link can now view this report" 
        : "Only you can access this report now",
    });
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Share "{report.name}" with your team or make it public
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="public-toggle" className="text-sm font-medium">
              Make report public
            </Label>
            <div className="text-sm text-muted-foreground">
              {isPublic 
                ? "Anyone with the link can view this report" 
                : "Only you can access this report"}
            </div>
          </div>
          <Switch
            id="public-toggle"
            checked={isPublic}
            onCheckedChange={handleTogglePublic}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  readOnly
                  value={shareUrl}
                  className="w-full"
                />
              </div>
              <Button size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  placeholder="colleague@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          {activeTab === "email" && (
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={isEmailSending || !email}
            >
              {isEmailSending ? "Sending..." : "Send"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
