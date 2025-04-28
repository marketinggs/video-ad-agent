
export interface ScriptVersion {
  length: "20" | "30" | "45";
  script: string;
  hooks: string[];
}

export interface GeneratedScripts {
  versions: ScriptVersion[];
}

export interface Program {
  id: string;
  name: string;
  highlights: string[];
  sellingPoints: string[];
  targetAudience: string;
  description: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}
