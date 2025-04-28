
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FileIcon, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProgramPdf } from "@/types/scriptTypes";

interface ProgramPdfListProps {
  programId: string;
  pdfs?: ProgramPdf[];
  onPdfDeleted: () => void;
}

const ProgramPdfList = ({ programId, pdfs = [], onPdfDeleted }: ProgramPdfListProps) => {
  const handleDelete = async (pdf: ProgramPdf) => {
    try {
      // First delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('program-materials')
        .remove([pdf.pdf_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        toast.error('Failed to delete file from storage');
        return;
      }

      // Then delete the database record
      const { error: dbError } = await supabase
        .from('program_pdfs')
        .delete()
        .eq('id', pdf.id);

      if (dbError) {
        console.error('Error deleting PDF record:', dbError);
        toast.error('Failed to delete PDF record');
        return;
      }

      toast.success('PDF deleted successfully');
      onPdfDeleted();
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast.error('An error occurred while deleting the PDF');
    }
  };

  if (!pdfs || pdfs.length === 0) {
    return <p className="text-sm text-muted-foreground">No PDFs uploaded yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pdfs.map((pdf) => (
          <TableRow key={pdf.id}>
            <TableCell className="flex items-center gap-2">
              <FileIcon className="h-4 w-4" />
              <span className="text-sm">{pdf.pdf_path.split('/').pop()}</span>
            </TableCell>
            <TableCell>
              {new Date(pdf.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(pdf)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProgramPdfList;
