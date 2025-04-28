
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Upload, AlertCircle, Video, Copy } from "lucide-react";
import { uploadFile, extractTextFromFile, analyzeVideo } from "@/services/fileProcessingService";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    setIsVideoFile(file.type.startsWith('video/'));
    setUploadedFilePath(null);
    
    try {
      if (file.type.startsWith('video/')) {
        setProgressStatus("Uploading video...");
        setProgress(20);
        
        // Upload the video file
        const filePath = await uploadFile(file);
        setUploadedFilePath(filePath);
        
        setProgressStatus("Processing video...");
        setProgress(60);
        setIsProcessing(true);
        
        // Basic processing to extract text
        const extractedText = await extractTextFromFile(file);
        
        setProgressStatus("Finalizing...");
        setProgress(90);
        
        // Pass the file and extracted text up to the parent component
        onFileUpload(file, extractedText);
        
        setProgress(100);
        toast.success(`File "${file.name}" processed successfully`);
        
        // Information about temporary storage
        toast.info("Note: Uploaded videos are automatically deleted after 2 hours");
      } else {
        setProgressStatus("Processing document...");
        setProgress(30);
        
        // Extract text content from the document file
        const extractedText = await extractTextFromFile(file);
        
        setProgressStatus("Finalizing...");
        setProgress(90);
        
        // Pass the file and extracted text up to the parent component
        onFileUpload(file, extractedText);
        
        setProgress(100);
        toast.success(`File "${file.name}" processed successfully`);
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
  
  const handleDetailedAnalysis = async () => {
    if (!uploadedFilePath) {
      toast.error("No video file has been uploaded");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const analysisText = await analyzeVideo(uploadedFilePath);
      setVideoAnalysis(analysisText);
      setShowAnalysisDialog(true);
    } catch (error: any) {
      console.error("Error analyzing video:", error);
      toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const copyAnalysisToClipboard = () => {
    if (videoAnalysis) {
      navigator.clipboard.writeText(videoAnalysis);
      toast.success("Analysis copied to clipboard");
    }
  };

  return (
    <>
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
      
      {isVideoFile && uploadedFilePath && !isUploading && !isProcessing && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="secondary"
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              handleDetailedAnalysis();
            }}
            disabled={isAnalyzing}
          >
            <Video className="h-4 w-4" />
            {isAnalyzing ? "Analyzing Video..." : "Run Detailed Video Analysis"}
          </Button>
        </div>
      )}
      
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Analysis</DialogTitle>
            <DialogDescription>
              Detailed analysis of your video using Gemini AI
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={copyAnalysisToClipboard}
            >
              <Copy className="h-4 w-4" /> Copy to Clipboard
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-line">
            {videoAnalysis}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadArea;
