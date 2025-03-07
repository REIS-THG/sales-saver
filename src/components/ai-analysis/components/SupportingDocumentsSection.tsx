
import React from "react";
import { FileText, Mail, FileIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUploadCard } from "./FileUploadCard";

interface SupportingDocumentsSectionProps {
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice' | 'audio') => void;
  isAnalysisLimited: boolean;
}

export function SupportingDocumentsSection({
  onFileUpload,
  isAnalysisLimited
}: SupportingDocumentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supporting Documents</CardTitle>
        <CardDescription>
          Upload supporting materials for better analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FileUploadCard
            icon={<FileText className="h-6 w-6" />}
            title="Call Transcripts"
            description="Upload call recordings or transcripts"
            accept=".txt,.doc,.docx,.pdf"
            onUpload={(file) => onFileUpload(file, 'transcript')}
            isDisabled={isAnalysisLimited}
          />
          <FileUploadCard
            icon={<Mail className="h-6 w-6" />}
            title="Email Threads"
            description="Upload email correspondence"
            accept=".eml,.msg,.txt"
            onUpload={(file) => onFileUpload(file, 'email')}
            isDisabled={isAnalysisLimited}
          />
          <FileUploadCard
            icon={<FileIcon className="h-6 w-6" />}
            title="Digital Files"
            description="Upload images, audio, or documents"
            accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav,.m4a,.ogg,.doc,.docx"
            onUpload={(file) => onFileUpload(file, 'audio')}
            isDisabled={isAnalysisLimited}
          />
        </div>
      </CardContent>
    </Card>
  );
}
