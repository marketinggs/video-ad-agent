
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Program } from "@/types/scriptTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgramSelectorProps {
  programs: Program[];
  onSelectProgram: (programId: string) => void;
  isLoading?: boolean;
}

const ProgramSelector = ({ programs, onSelectProgram, isLoading = false }: ProgramSelectorProps) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleProgramChange = (value: string) => {
    const program = programs.find(p => p.id === value) || null;
    setSelectedProgram(program);
    onSelectProgram(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 w-full">
        <label className="text-sm font-medium">Select Program</label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium">Select Program</label>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
            <Select onValueChange={handleProgramChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a GrowthSchool program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </HoverCardTrigger>
        {selectedProgram && (
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">{selectedProgram.name}</h4>
              {selectedProgram.description && (
                <p className="text-sm text-muted-foreground">{selectedProgram.description}</p>
              )}
              {selectedProgram.highlights && selectedProgram.highlights.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium uppercase text-muted-foreground">Highlights</h5>
                  <ul className="text-sm list-disc pl-4">
                    {selectedProgram.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedProgram.targetAudience && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium uppercase text-muted-foreground">Target Audience</h5>
                  <p className="text-sm">{selectedProgram.targetAudience}</p>
                </div>
              )}
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
    </div>
  );
};

export default ProgramSelector;
