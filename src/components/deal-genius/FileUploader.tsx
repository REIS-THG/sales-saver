
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
  onUpload: (file: File) => void;
  isDisabled?: boolean;
}

export function FileUploader({
  icon,
  title,
  description,
  accept,
  onUpload,
  isDisabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isDisabled) return;

    const file = e.dataTransfer.files[0];
    if (file && accept.split(',').some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))) {
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await onUpload(file);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <Card
      className={`
        ${isDragging ? 'border-primary border-2' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        transition-all duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        
        {isUploading ? (
          <Progress value={uploadProgress} className="w-full" />
        ) : (
          <div className="flex justify-center">
            <label className={`${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileSelect}
                disabled={isDisabled}
              />
              <Button
                variant="outline"
                className="gap-2"
                disabled={isDisabled}
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
