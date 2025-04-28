import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import Header from "@/components/Header";
import ProgramPdfList from "@/components/ProgramPdfList";
import { getOrCreateProgram, uploadProgramPdf, fetchProgramsWithPdfs } from "@/services/programService";

const Programs = () => {
  const { user } = useAuth();
  const [programName, setProgramName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    fetchProgramsList();
  }, []);

  // If user is not authenticated, redirect to the auth page
  if (!user) {
    toast.error("Please sign in to access this page");
    return <Navigate to="/auth" replace />;
  }

  const fetchProgramsList = async () => {
    try {
      const programsData = await fetchProgramsWithPdfs();
      setPrograms(programsData || []);
    } catch (error) {
      toast.error("Failed to fetch programs");
      console.error("Error fetching programs:", error);
    }
  };

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
      // Get or create program
      const programId = await getOrCreateProgram(programName, user.id);
      
      // Upload the PDF and associate it with the program
      await uploadProgramPdf(file, programId);

      toast.success("Program PDF uploaded successfully!");
      setProgramName("");
      fetchProgramsList();
      
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

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Existing Programs</h2>
          <div className="space-y-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{program.name}</h3>
                <ProgramPdfList
                  programId={program.id}
                  pdfs={program.program_pdfs}
                  onPdfDeleted={fetchProgramsList}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programs;
