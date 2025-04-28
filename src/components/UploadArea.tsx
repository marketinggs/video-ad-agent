
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, AlertCircle } from "lucide-react";
import { uploadFile, extractTextFromFile } from "@/services/fileProcessingService";
import { Progress } from "@/components/ui/progress";

interface UploadAreaProps {
  onFileUpload: (file: File, extractedText: string) => void;
}

const UploadArea = ({ onFileUpload }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    // Check if file type is supported
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      toast.error("Please upload a video (.mp4, .webm, .mov) or document (.txt, .docx) file");
      return false;
    }
    
    // Check file size for videos (100MB limit)
    if (file.type.startsWith('video/') && file.size > 100 * 1024 * 1024) {
      toast.error("Video file too large. Maximum size is 100MB");
      return false;
    }
    
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }
    
    setFileName(file.name);
    setIsUploading(true);
    setProgress(0);
    
    try {
      if (file.type.startsWith('video/')) {
        setProgressStatus("Uploading video...");
        setProgress(20);
        
        // Upload the video file
        await uploadFile(file);
        
        setProgressStatus("Analyzing video content...");
        setProgress(50);
        setIsProcessing(true);
      } else {
        setProgressStatus("Processing document...");
        setProgress(30);
      }
      
      // Extract text content from the file
      const extractedText = await extractTextFromFile(file);
      
      setProgressStatus("Finalizing...");
      setProgress(90);
      
      // Pass the file and extracted text up to the parent component
      onFileUpload(file, extractedText);
      
      setProgress(100);
      toast.success(`File "${file.name}" processed successfully`);
      
      // Information about temporary storage
      if (file.type.startsWith('video/')) {
        toast.info("Note: Uploaded videos are automatically deleted after 2 hours");
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast.error(`Error: ${error.message || "Failed to process file"}`);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`upload-area w-full p-8 rounded-lg border border-dashed transition-all cursor-pointer ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      } ${fileName ? "bg-primary/5" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Upload className="h-10 w-10 text-primary mb-2" />
        <h3 className="font-medium text-lg">
          {fileName 
            ? `File: ${fileName}` 
            : "Upload Reference Material"}
        </h3>
        
        {(isUploading || isProcessing) && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{progressStatus}</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        )}
        
        {!isUploading && !isProcessing && (
          <p className="text-sm text-gray-500 mb-2">
            {fileName
              ? "Click or drag to replace"
              : "Drag & drop video (.mp4, .mov, .webm) or script (.txt, .docx)"}
          </p>
        )}
        
        <Button 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileInput();
          }}
          disabled={isUploading || isProcessing}
        >
          {isUploading || isProcessing ? "Processing..." : "Browse Files"}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp4,.mov,.webm,.txt,.docx"
          onChange={handleFileChange}
          disabled={isUploading || isProcessing}
        />
        
        {!isUploading && !isProcessing && (
          <p className="text-xs text-gray-400 mt-2">
            Video files are automatically deleted after 2 hours
          </p>
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-amber-600 mt-1">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs">Video processing may take a moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;
