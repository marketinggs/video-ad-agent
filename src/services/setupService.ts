
import { supabase } from "@/integrations/supabase/client";

/**
 * Initializes application storage and other required resources
 * This should be called when the application starts
 */
export async function initializeApp(): Promise<void> {
  try {
    // Ensure storage buckets are created
    await supabase.functions.invoke('create-buckets');
    console.log("Storage buckets verified");
  } catch (error) {
    console.error("Error initializing app:", error);
    // We don't throw here to avoid blocking app startup
  }
}
