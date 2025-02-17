
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CustomField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  created_at: string;
}

interface CustomFieldsTableProps {
  fields: CustomField[];
  onDelete: (fieldId: string) => void;
}

export function CustomFieldsTable({ fields, onDelete }: CustomFieldsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.id}>
            <TableCell>{field.field_name}</TableCell>
            <TableCell className="capitalize">{field.field_type}</TableCell>
            <TableCell>{field.is_required ? "Yes" : "No"}</TableCell>
            <TableCell>{new Date(field.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <ConfirmDialog
                title="Delete Custom Field"
                description={`Are you sure you want to delete the "${field.field_name}" field? This action cannot be undone and may affect existing deals using this field.`}
                onConfirm={() => onDelete(field.id)}
                triggerButton={
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
