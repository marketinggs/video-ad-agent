
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptCard from "./ScriptCard";
import { ScriptVersion } from "@/types/scriptTypes";

interface ScriptDisplayProps {
  scripts: {
    versions: ScriptVersion[];
  } | null;
}

const ScriptDisplay = ({ scripts }: ScriptDisplayProps) => {
  if (!scripts) return null;
  
  if (!scripts.versions || !Array.isArray(scripts.versions)) {
    console.error("Invalid scripts data:", scripts);
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Generated Scripts</h2>
        <p className="text-muted-foreground">
          Choose between different script lengths and hook options
        </p>
      </div>
      
      <Tabs defaultValue="20" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="20">20 Seconds</TabsTrigger>
          <TabsTrigger value="30">30 Seconds</TabsTrigger>
          <TabsTrigger value="45">45 Seconds</TabsTrigger>
        </TabsList>
        
        {scripts.versions.map((version) => (
          <TabsContent key={version.length} value={version.length}>
            <ScriptCard version={version} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScriptDisplay;
