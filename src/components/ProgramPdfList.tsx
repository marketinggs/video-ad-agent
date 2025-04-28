
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FileIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProgramPdf {
  id: string;
  pdf_path: string;
  created_at: string;
}

interface ProgramPdfListProps {
  programId: string;
  pdfs: ProgramPdf[];
  onPdfDeleted: () => void;
}

const ProgramPdfList = ({ programId, pdfs, onPdfDeleted }: ProgramPdfListProps) => {
  const handleDelete = async (pdfId: string) => {
    const { error } = await supabase
      .from('program_pdfs')
      .delete()
      .eq('id', pdfId);

    if (!error) {
      onPdfDeleted();
    }
  };

  if (!pdfs.length) {
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
                onClick={() => handleDelete(pdf.id)}
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
