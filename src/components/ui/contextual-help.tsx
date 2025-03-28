
import { useState, useEffect, ReactNode } from "react";
import { HelpCircle, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpButton } from "@/components/ui/help-button";

interface ContextualHelpProps {
  id: string;
  title: string;
  description: ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  initialShow?: boolean;
  persistent?: boolean;
  tooltipOnly?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export function ContextualHelp({
  id,
  title,
  description,
  placement = "right",
  align = "center",
  initialShow = false,
  persistent = false,
  tooltipOnly = false,
  className = "",
  onDismiss,
}: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(initialShow);
  const [hasDismissed, setHasDismissed] = useState(false);
  const storageKey = `help-${id}-dismissed`;

  useEffect(() => {
    if (persistent) return;
    const isDismissed = localStorage.getItem(storageKey) === "true";
    setHasDismissed(isDismissed);
    setIsVisible(initialShow && !isDismissed);
  }, [id, initialShow, persistent, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (!persistent) {
      localStorage.setItem(storageKey, "true");
      setHasDismissed(true);
    }
    if (onDismiss) onDismiss();
  };

  const handleReset = () => {
    localStorage.removeItem(storageKey);
    setHasDismissed(false);
    setIsVisible(true);
  };

  if (tooltipOnly) {
    return (
      <HelpButton
        tooltipContent={
          <div className="max-w-xs">
            <p className="font-medium">{title}</p>
            <div className="mt-1 text-sm">{description}</div>
          </div>
        }
        side={placement}
        align={align}
        className={className}
      />
    );
  }

  if (hasDismissed && !persistent) {
    return (
      <HelpButton
        tooltipContent={
          <div>
            <p className="font-medium">{title}</p>
            <div className="mt-1 text-sm">{description}</div>
            <Button 
              variant="link" 
              className="mt-2 p-0 h-auto text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
            >
              Show this tip again
            </Button>
          </div>
        }
        className={className}
        side={placement}
        align={align}
      />
    );
  }

  if (!isVisible) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={`h-7 w-7 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 ${className}`}
        onClick={() => setIsVisible(true)}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Show help</span>
      </Button>
    );
  }

  return (
    <Card className={`max-w-sm shadow-lg bg-white dark:bg-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-500" />
            {title}
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 -mt-1 -mr-1 text-gray-500"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardDescription>{typeof description === 'string' ? description : null}</CardDescription>
      </CardHeader>
      {typeof description !== 'string' && (
        <CardContent className="pt-0 pb-2">{description}</CardContent>
      )}
      <CardFooter className="pt-0 flex justify-end gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-8"
          onClick={handleDismiss}
        >
          <Check className="h-3 w-3 mr-1" /> 
          Got it
        </Button>
      </CardFooter>
    </Card>
  );
}
