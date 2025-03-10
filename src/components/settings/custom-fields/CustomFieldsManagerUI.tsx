
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomField } from "@/types/custom-field";
import { CustomFieldsTable } from "./CustomFieldsTable";
import { CustomFieldForm } from "./CustomFieldForm";
import { useCustomFields } from "./useCustomFields";

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
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Manage custom fields for your deals</CardDescription>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <CustomFieldForm
            initialData={editingField || undefined}
            onSubmit={handleFormSubmit}
          />
        ) : (
          <CustomFieldsTable
            fields={customFields}
            isLoading={isLoading}
            onEdit={handleEditField}
            onDelete={deleteField}
            onUpdate={toggleFieldStatus}
          />
        )}
      </CardContent>
      {!showForm && (
        <CardFooter>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Field
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
