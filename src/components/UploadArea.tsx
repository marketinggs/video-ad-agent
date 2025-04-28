
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";
import { uploadFile, extractTextFromFile } from "@/services/fileProcessingService";

interface UploadAreaProps {
  onFileUpload: (file: File, extractedText: string) => void;
}

const UploadArea = ({ onFileUpload }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFile = async (file: File) => {
    const validTypes = [
      'video/mp4',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      toast.error("Please upload a .mp4, .txt, or .docx file");
      return;
    }
    
    setFileName(file.name);
    setIsUploading(true);
    
    try {
      // Extract text content from the file
      const extractedText = await extractTextFromFile(file);
      
      // Upload the file to storage
      await uploadFile(file);
      
      // Pass the file and extracted text up to the parent component
      onFileUpload(file, extractedText);
      
      toast.success(`File "${file.name}" uploaded and processed successfully`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please try again.");
    } finally {
      setIsUploading(false);
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
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Upload className="h-10 w-10 text-primary mb-2" />
        <h3 className="font-medium text-lg">
          {fileName 
            ? `File: ${fileName}` 
            : isUploading 
              ? "Processing file..." 
              : "Upload Reference Material"}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {fileName
            ? "Click or drag to replace"
            : "Drag & drop your video (.mp4) or script (.txt, .docx)"}
        </p>
        <Button 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileInput();
          }}
          disabled={isUploading}
        >
          {isUploading ? "Processing..." : "Browse Files"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp4,.txt,.docx"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default UploadArea;
