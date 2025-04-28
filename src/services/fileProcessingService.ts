
import { supabase } from "./supabaseClient";

/**
 * Uploads a file to Supabase storage and returns the file path
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    
    // Upload the file to Supabase storage
    const { error } = await supabase.storage
      .from('reference-materials')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Return the file path
    return filePath;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Extracts text content from a file (txt, docx, or mp4)
 * For txt files, reads the text directly
 * For docx files, uses a library to extract text
 * For mp4 files, would normally use a transcription service
 * 
 * For this implementation, we'll just handle txt files and simulate the others
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'text/plain') {
      // Read text file
      return await file.text();
    } else if (file.name.endsWith('.docx')) {
      // In a real app, you'd use a library like mammoth.js to extract text from docx
      // For now, we'll simulate it
      return "This is simulated text extracted from a DOCX file. In a real application, you would use a library like mammoth.js to extract the actual text content.";
    } else if (file.type === 'video/mp4') {
      // In a real app, you'd use a transcription service
      // For now, we'll simulate it
      return "This is simulated transcription text from a video file. In a real application, you would use a service like AWS Transcribe, Google Speech-to-Text, or OpenAI Whisper API to transcribe the audio from the video.";
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}
