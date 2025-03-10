
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CustomField } from "@/types/custom-field";
import { useCustomFields } from "./useCustomFields";
import { CustomFieldsHeader } from "./components/CustomFieldsHeader";
import { CustomFieldsContent } from "./components/CustomFieldsContent";
import { CustomFieldsActions } from "./components/CustomFieldsActions";

export function CustomFieldsManagerUI() {
  const [showForm, setShowForm] = useState(false);
  const { 
    customFields, 
    isLoading, 
    editingField, 
    setEditingField,
    createField,
    updateField,
    deleteField,
    toggleFieldStatus
  } = useCustomFields();

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Omit<CustomField, 'id'>) => {
    if (editingField) {
      await updateField(editingField.id, data);
      setEditingField(null);
    } else {
      await createField(data);
    }
    setShowForm(false);
  };

  return (
    <Card>
      <CustomFieldsHeader />
      <CustomFieldsContent
        showForm={showForm}
        customFields={customFields}
        isLoading={isLoading}
        editingField={editingField}
        onEdit={handleEditField}
        onDelete={deleteField}
        onToggleStatus={toggleFieldStatus}
        onSubmit={handleFormSubmit}
      />
      {!showForm && (
        <CustomFieldsActions onAddField={() => setShowForm(true)} />
      )}
    </Card>
  );
}
