
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";

const Programs = () => {
  const { user } = useAuth();
  const [programName, setProgramName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // If user is not authenticated, redirect to the auth page
  if (!user) {
    toast.error("Please sign in to access this page");
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!programName.trim()) {
      toast.error("Please enter a program name");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);

    try {
      // Upload PDF to storage
      const fileExt = "pdf";
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create program entry in database
      const { error: dbError } = await supabase
        .from("programs")
        .insert([
          {
            name: programName,
            pdf_path: filePath,
            user_id: user.id // Associate program with the current user
          },
        ]);

      if (dbError) throw dbError;

      toast.success("Program uploaded successfully!");
      setProgramName("");
      
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }

    } catch (error) {
      console.error("Error uploading program:", error);
      toast.error("Failed to upload program");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Program Management</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Program</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="programName" className="block text-sm font-medium mb-1">
                Program Name
              </label>
              <Input
                id="programName"
                type="text"
                placeholder="Enter program name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="pdfUpload" className="block text-sm font-medium mb-1">
                Program PDF
              </label>
              <Input
                id="pdfUpload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full"
              />
            </div>

            {isUploading && (
              <div className="text-sm text-gray-600">
                Uploading program...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
