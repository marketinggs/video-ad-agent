
import { useState } from "react";
import UploadArea from "@/components/UploadArea";
import ProgramSelector from "@/components/ProgramSelector";
import ModelSelector from "@/components/ModelSelector";
import ScriptGenerator from "@/components/ScriptGenerator";
import ScriptDisplay from "@/components/ScriptDisplay";
import { demoPrograms, aiModels, GeneratedScripts } from "@/data/demoData";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScripts | null>(null);

  const handleFileUpload = (file: File) => {
    setFileUploaded(true);
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleScriptsGenerated = (scripts: GeneratedScripts) => {
    setGeneratedScripts(scripts);
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById("results-section");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/90 to-primary py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Ad Alchemy Scribe</h1>
          <p className="text-white/90 mt-2">
            Transform reference material into compelling video ad scripts for GrowthSchool programs
          </p>
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
              <ProgramSelector programs={demoPrograms} onSelectProgram={handleProgramSelect} />
              <ModelSelector models={aiModels} onSelectModel={handleModelSelect} />
            </div>
            
            {/* Generate button */}
            <ScriptGenerator 
              programId={selectedProgramId} 
              modelId={selectedModelId} 
              fileUploaded={fileUploaded}
              onScriptsGenerated={handleScriptsGenerated} 
            />
          </section>
          
          {/* Results section */}
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
      
      {/* Footer */}
      <footer className="bg-gray-50 py-6 px-4 border-t">
        <div className="container mx-auto max-w-4xl text-center text-sm text-gray-500">
          <p>© 2025 GrowthSchool. Ad Alchemy Scribe - Video Ad Script Generator</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
