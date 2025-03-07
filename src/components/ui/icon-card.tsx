
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface IconCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function IconCard({
  title,
  description,
  icon,
  actionText,
  onAction,
  isLoading = false,
  isDisabled = false,
  headerContent,
  footerContent,
  className = "",
  children
}: IconCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {headerContent}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        
        {(actionText || onAction) && (
          <Button 
            className="w-full" 
            onClick={onAction}
            disabled={isDisabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              actionText
            )}
          </Button>
        )}
        
        {footerContent}
      </CardContent>
    </Card>
  );
}
