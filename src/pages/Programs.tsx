
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { FileText, Upload } from "lucide-react";
import Header from "@/components/Header";
import ProgramPdfList from "@/components/ProgramPdfList";
import { getOrCreateProgram, uploadProgramPdf, fetchProgramsWithPdfs } from "@/services/programService";
import { Program } from "@/types/scriptTypes";

const Programs = () => {
  const { user } = useAuth();
  const [programName, setProgramName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Define fetchProgramsList BEFORE using it in the useEffect
  const fetchProgramsList = async () => {
    try {
      const programsData = await fetchProgramsWithPdfs();
      setPrograms(programsData || []);
    } catch (error) {
      toast.error("Failed to fetch programs");
      console.error("Error fetching programs:", error);
    }
  };

  useEffect(() => {
    fetchProgramsList();
  }, []);

  if (!user) {
    toast.error("Please sign in to access this page");
    return <Navigate to="/auth" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, existingProgramId?: string) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!existingProgramId && !programName.trim()) {
      toast.error("Please enter a program name");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploading(true);

    try {
      const programId = existingProgramId || await getOrCreateProgram(programName, user.id);
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

  // Check if any programs have PDFs
  const hasProgramsWithPdfs = programs.some(program => program.pdfs && program.pdfs.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Program Management</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                onChange={(e) => handleFileUpload(e)}
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

        {programs.length > 0 && (
          <div>
            {hasProgramsWithPdfs && <h2 className="text-xl font-semibold mb-4">Existing Programs</h2>}
            <div className="space-y-6">
              {programs.map((program) => (
                <div key={program.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">{program.name}</h3>
                  {program.pdfs && program.pdfs.length > 0 ? (
                    <ProgramPdfList
                      programId={program.id}
                      pdfs={program.pdfs}
                      onPdfDeleted={fetchProgramsList}
                    />
                  ) : (
                    <div className="flex flex-col items-center py-4 space-y-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">No PDFs uploaded yet</p>
                      <div className="w-full max-w-xs">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, program.id)}
                          disabled={isUploading}
                          className="w-full"
                        />
                        <Button
                          variant="outline"
                          className="mt-2 w-full"
                          disabled={isUploading}
                          onClick={() => document.querySelector<HTMLInputElement>(`input[type="file"][accept=".pdf"]`)?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
