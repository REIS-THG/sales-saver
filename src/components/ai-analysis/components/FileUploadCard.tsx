
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileUploadCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
  onUpload: (file: File) => void;
  isDisabled?: boolean;
}

export function FileUploadCard({
  icon,
  title,
  description,
  accept,
  onUpload,
  isDisabled = false,
}: FileUploadCardProps) {
  return (
    <Card className={`relative ${isDisabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label className={`block ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && !isDisabled) {
                onUpload(file);
              }
            }}
            disabled={isDisabled}
          />
          <Button variant="outline" className="w-full" disabled={isDisabled}>
            Choose File
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}
