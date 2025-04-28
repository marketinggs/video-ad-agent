import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import UploadArea from "@/components/UploadArea";
import ProgramSelector from "@/components/ProgramSelector";
import ModelSelector from "@/components/ModelSelector";
import ScriptGenerator from "@/components/ScriptGenerator";
import ScriptDisplay from "@/components/ScriptDisplay";
import { aiModels } from "@/data/demoData";
import { Separator } from "@/components/ui/separator";
import { GeneratedScripts, Program, AIModel } from "@/types/scriptTypes";
import { useAuth } from "@/contexts/AuthContext";
import { initializeApp } from "@/services/setupService";
import { fetchProgramsWithPdfs } from "@/services/programService";

const Index = () => {
  const { user } = useAuth();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [referenceText, setReferenceText] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScripts | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [models] = useState<AIModel[]>(aiModels);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  
  useEffect(() => {
    // Initialize app on component mount
    const init = async () => {
      await initializeApp();
    };
    
    init();
    fetchPrograms();
  }, [user]); // Refetch when user changes
  
  const fetchPrograms = async () => {
    if (!user) {
      setPrograms([]);
      return;
    }

    setIsLoadingPrograms(true);
    try {
      // Use the new service function
      const formattedPrograms = await fetchProgramsWithPdfs();
      setPrograms(formattedPrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const handleFileUpload = (file: File, extractedText: string) => {
    setReferenceText(extractedText);
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleScriptsGenerated = (scripts: GeneratedScripts) => {
    setGeneratedScripts(scripts);
    // Store the generated scripts in Supabase in a real app
    // saveGeneratedScripts(selectedProgramId, scripts);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById("results-section");
      if (resultsElement) {
        resultsElement.scrollIntoView({
          behavior: "smooth"
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8">
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Create New Scripts</h2>
              <p className="text-muted-foreground">
                Upload reference material and select options to generate tailored ad scripts
              </p>
            </div>
            
            <UploadArea onFileUpload={handleFileUpload} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgramSelector 
                programs={programs} 
                onSelectProgram={handleProgramSelect}
                isLoading={isLoadingPrograms}
              />
              <ModelSelector models={models} onSelectModel={handleModelSelect} />
            </div>
            
            <ScriptGenerator 
              programId={selectedProgramId}
              modelId={selectedModelId}
              referenceText={referenceText}
              programs={programs}
              onScriptsGenerated={handleScriptsGenerated}
            />
          </section>
          
          {generatedScripts && (
            <>
              <Separator className="my-4" />
              <section id="results-section" className="space-y-6">
                <ScriptDisplay scripts={generatedScripts} />
              </section>
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-50 py-6 px-4 border-t">
        <div className="container mx-auto max-w-4xl text-center text-sm text-gray-500">
          <p>© 2025 GrowthSchool - Video Ad Script Generator</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
