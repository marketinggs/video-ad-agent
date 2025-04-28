
import { useState } from "react";
import UploadArea from "@/components/UploadArea";
import ProgramSelector from "@/components/ProgramSelector";
import ModelSelector from "@/components/ModelSelector";
import ScriptGenerator from "@/components/ScriptGenerator";
import ScriptDisplay from "@/components/ScriptDisplay";
import { demoPrograms, aiModels } from "@/data/demoData";
import { Separator } from "@/components/ui/separator";
import { GeneratedScripts, Program, AIModel } from "@/types/scriptTypes";
import { supabase } from "@/services/supabaseClient";

const Index = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [referenceText, setReferenceText] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScripts | null>(null);
  const [programs, setPrograms] = useState<Program[]>(demoPrograms);
  const [models] = useState<AIModel[]>(aiModels);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  
  // This would be called on component mount in a real app
  // For now, we'll use the demo data
  const fetchPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      // In a real app, this would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('programs')
      //   .select('*');
      
      // if (error) throw error;
      // setPrograms(data);
      
      // Using demo data for now
      setPrograms(demoPrograms);
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

  return <div className="min-h-screen bg-white">
    {/* Header */}
    <header className="bg-gradient-to-r from-primary/90 to-primary py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white">GrowthSchool | Video Ad Agent</h1>
        <p className="text-white/90 mt-2">Upload a reference, select the program, hit generate — and boom, your scripts are ready!</p>
      </div>
    </header>
    
    {/* Main content */}
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8">
        {/* Input section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create New Scripts</h2>
            <p className="text-muted-foreground">
              Upload reference material and select options to generate tailored ad scripts
            </p>
          </div>
          
          {/* Upload area */}
          <UploadArea onFileUpload={handleFileUpload} />
          
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgramSelector 
              programs={programs} 
              onSelectProgram={handleProgramSelect}
              isLoading={isLoadingPrograms}
            />
            <ModelSelector models={models} onSelectModel={handleModelSelect} />
          </div>
          
          {/* Generate button */}
          <ScriptGenerator 
            programId={selectedProgramId}
            modelId={selectedModelId}
            referenceText={referenceText}
            programs={programs}
            onScriptsGenerated={handleScriptsGenerated}
          />
        </section>
        
        {/* Results section */}
        {generatedScripts && <>
          <Separator className="my-4" />
          <section id="results-section" className="space-y-6">
            <ScriptDisplay scripts={generatedScripts} />
          </section>
        </>}
      </div>
    </main>
    
    {/* Footer */}
    <footer className="bg-gray-50 py-6 px-4 border-t">
      <div className="container mx-auto max-w-4xl text-center text-sm text-gray-500">
        <p>© 2025 GrowthSchool - Video Ad Script Generator</p>
      </div>
    </footer>
  </div>;
};

export default Index;
