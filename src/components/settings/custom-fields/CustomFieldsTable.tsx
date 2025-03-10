
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CustomField } from "@/types/custom-field";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface CustomFieldsTableProps {
  fields: CustomField[];
  onDelete: (fieldId: string) => void;
  onUpdate: (field: Partial<CustomField> & { id: string }) => void;
  onEdit: (field: CustomField) => void;
  isLoading?: boolean;
}

export function CustomFieldsTable({ fields, onDelete, onUpdate, onEdit, isLoading }: CustomFieldsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Field Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Multiple Values</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.id}>
            <TableCell>
              <div className="flex flex-col">
                <span>{field.field_name}</span>
                {field.help_text && (
                  <span className="text-sm text-gray-500">{field.help_text}</span>
                )}
              </div>
            </TableCell>
            <TableCell className="capitalize">{field.field_type}</TableCell>
            <TableCell>{field.is_required ? <Check className="text-green-500 h-4 w-4" /> : <X className="text-gray-400 h-4 w-4" />}</TableCell>
            <TableCell>{field.allow_multiple ? <Check className="text-green-500 h-4 w-4" /> : <X className="text-gray-400 h-4 w-4" />}</TableCell>
            <TableCell>
              <Switch 
                checked={field.is_active} 
                onCheckedChange={(checked) => onUpdate({ id: field.id, is_active: checked })}
                disabled={isLoading}
              />
            </TableCell>
            <TableCell>{new Date(field.created_at!).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(field)}
                >
                  <Edit2 className="h-4 w-4 text-blue-500" />
                </Button>
                <ConfirmDialog
                  title="Delete Custom Field"
                  description={`Are you sure you want to delete the "${field.field_name}" field? This action cannot be undone and may affect existing deals using this field.`}
                  onConfirm={() => onDelete(field.id)}
                  triggerButton={
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
