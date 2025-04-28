
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
  highlights?: string[];
  sellingPoints?: string[];
  targetAudience?: string;
  description?: string;
  created_at?: string;
  user_id?: string;
  pdfs?: ProgramPdf[];
}

export interface ProgramPdf {
  id: string;
  program_id: string;
  pdf_path: string;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}
