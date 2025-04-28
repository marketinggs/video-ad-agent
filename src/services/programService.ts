
import { supabase } from "@/integrations/supabase/client";
import { Program, ProgramPdf } from "@/types/scriptTypes";

/**
 * Fetches all programs with their associated PDFs
 */
export async function fetchProgramsWithPdfs(): Promise<Program[]> {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        id,
        name,
        created_at,
        user_id,
        program_pdfs (
          id,
          pdf_path,
          created_at
        )
      `);
    
    if (error) throw error;
    
    // Format the data to match our Program interface
    const formattedPrograms: Program[] = data?.map(item => ({
      id: item.id,
      name: item.name,
      created_at: item.created_at,
      user_id: item.user_id,
      highlights: [],
      sellingPoints: [],
      description: "Uploaded program",
      targetAudience: "",
      pdfs: item.program_pdfs?.map(pdf => ({
        id: pdf.id,
        program_id: item.id,
        pdf_path: pdf.pdf_path,
        created_at: pdf.created_at
      })) || []
    })) || [];
    
    return formattedPrograms;
  } catch (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
}

/**
 * Gets or creates a program by name and returns its ID
 */
export async function getOrCreateProgram(name: string, userId: string): Promise<string> {
  try {
    // First check if program exists for this user
    const { data: existingPrograms, error: fetchError } = await supabase
      .from('programs')
      .select('id')
      .eq('name', name)
      .eq('user_id', userId)
      .limit(1);
      
    if (fetchError) throw fetchError;
    
    // If program exists for this user, return its ID
    if (existingPrograms && existingPrograms.length > 0) {
      return existingPrograms[0].id;
    }
    
    // Create new program if it doesn't exist for this user
    const { data: newProgram, error: createError } = await supabase
      .from('programs')
      .insert([{ name, user_id: userId }])
      .select()
      .single();
      
    if (createError) throw createError;
    
    return newProgram.id;
  } catch (error) {
    console.error("Error getting/creating program:", error);
    throw error;
  }
}

/**
 * Uploads a PDF file and associates it with a program
 */
export async function uploadProgramPdf(file: File, programId: string): Promise<ProgramPdf> {
  try {
    // Upload PDF to storage
    const fileExt = "pdf";
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("program-materials")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create program_pdf entry
    const { data: programPdf, error: pdfError } = await supabase
      .from('program_pdfs')
      .insert([{
        program_id: programId,
        pdf_path: filePath,
      }])
      .select()
      .single();

    if (pdfError) throw pdfError;

    return programPdf;
  } catch (error) {
    console.error("Error uploading program PDF:", error);
    throw error;
  }
}
