
import { CardContent } from "@/components/ui/card";
import { CustomField } from "@/types/custom-field";
import { CustomFieldsTable } from "../CustomFieldsTable";
import { CustomFieldForm } from "../CustomFieldForm";

interface CustomFieldsContentProps {
  showForm: boolean;
  customFields: CustomField[];
  isLoading: boolean;
  editingField: CustomField | null;
  onEdit: (field: CustomField) => void;
  onDelete: (fieldId: string) => void;
  onToggleStatus: (field: Partial<CustomField> & { id: string }) => void;
  onSubmit: (data: Omit<CustomField, 'id'>) => Promise<void>;
}

export function CustomFieldsContent({
  showForm,
  customFields,
  isLoading,
  editingField,
  onEdit,
  onDelete,
  onToggleStatus,
  onSubmit
}: CustomFieldsContentProps) {
  return (
    <CardContent>
      {showForm ? (
        <CustomFieldForm
          initialData={editingField || undefined}
          onSubmit={onSubmit}
        />
      ) : (
        <CustomFieldsTable
          fields={customFields}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onToggleStatus}
        />
      )}
    </CardContent>
  );
}
