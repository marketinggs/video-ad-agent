
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
    toast({
      title: "Initialization Error",
      description: "There was an issue setting up the application. Some features may be limited.",
      variant: "destructive",
    });
    // We don't throw here to avoid blocking app startup
  }
}
