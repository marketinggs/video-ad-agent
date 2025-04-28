
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Initializes application storage and other required resources
 * This should be called when the application starts
 */
export async function initializeApp(): Promise<void> {
  try {
    console.log("Initializing application...");
    
    // Ensure storage buckets are created
    const { data, error } = await supabase.functions.invoke('create-buckets');
    
    if (error) {
      console.error("Error calling create-buckets function:", error);
      toast({
        title: "Setup Warning",
        description: "Some application features might be limited. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }
    
    if (data?.success) {
      console.log("Storage setup completed successfully:", data.message);
    } else {
      console.warn("Storage setup completed with warnings:", data?.message);
    }
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
