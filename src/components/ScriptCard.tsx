import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Download } from "lucide-react";
import { ScriptVersion } from "@/types/scriptTypes";

interface ScriptCardProps {
  version: ScriptVersion;
}

const ScriptCard = ({ version }: ScriptCardProps) => {
  const [activeHookIndex, setActiveHookIndex] = useState(0);
  
  const handleCopyScript = () => {
    const fullScript = `${version.hooks[activeHookIndex]}\n\n${version.script}`;
    navigator.clipboard.writeText(fullScript);
    toast.success("Script copied to clipboard!");
  };
  
  const handleDownload = (format: "txt" | "docx") => {
    const fullScript = `${version.hooks[activeHookIndex]}\n\n${version.script}`;
    
    // In a real app, we would generate and download the file
    // For demo purposes, we'll just show a toast
    toast.success(`Downloaded as ${format.toUpperCase()} file`);
  };

  if (!version || !version.hooks || !Array.isArray(version.hooks)) {
    console.error("Invalid version data:", version);
    return null;
  }

  return (
    <Card className="w-full script-transition animate-fade-in">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{version.length}-Second Version</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload("txt")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              .TXT
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload("docx")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              .DOCX
            </Button>
          </div>
        </CardTitle>
        <CardDescription>With 3 alternative hooks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Hook Options</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyScript}
              className="text-xs"
            >
              Copy Full Script
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {version.hooks.map((hook, index) => (
              <Button
                key={index}
                variant={activeHookIndex === index ? "default" : "outline"}
                className={`text-xs h-auto py-2 ${
                  activeHookIndex === index ? "bg-primary text-white" : ""
                }`}
                onClick={() => setActiveHookIndex(index)}
              >
                Option {index + 1}
              </Button>
            ))}
          </div>
          
          <div className="bg-primary-50 p-3 rounded-md mt-2">
            <p className="text-sm italic">"{version.hooks[activeHookIndex]}"</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Script Body</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm">{version.script}</p>
          </div>
        </div>
        
        <div className="pt-2">
          <p className="text-xs text-gray-500">
            Word Count: ~{version.script.split(' ').length} words | 
            Character Count: ~{version.script.length} characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptCard;
