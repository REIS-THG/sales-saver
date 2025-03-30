
import { useState } from "react";
import { CustomField } from "@/types/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomFieldsSectionProps {
  customFields: CustomField[];
  values: Record<string, any>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export function CustomFieldsSection({
  customFields,
  values,
  onChange,
}: CustomFieldsSectionProps) {
  if (!customFields.length) return null;

  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    onChange((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Custom Fields</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.field_name}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.field_type === "text" && (
              <Input
                id={field.id}
                value={values[field.field_name] || ""}
                onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                placeholder={`Enter ${field.field_name.toLowerCase()}`}
              />
            )}

            {field.field_type === "number" && (
              <Input
                id={field.id}
                type="number"
                value={values[field.field_name] || ""}
                onChange={(e) => handleFieldChange(field.field_name, parseFloat(e.target.value) || 0)}
                placeholder={`Enter ${field.field_name.toLowerCase()}`}
              />
            )}

            {field.field_type === "boolean" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.id}
                  checked={values[field.field_name] || false}
                  onCheckedChange={(checked) => handleFieldChange(field.field_name, checked)}
                />
                <Label htmlFor={field.id}>
                  {values[field.field_name] ? "Yes" : "No"}
                </Label>
              </div>
            )}

            {field.field_type === "multi-select" && field.options && (
              <Select
                value={values[field.field_name] || ""}
                onValueChange={(value) => handleFieldChange(field.field_name, value)}
              >
                <SelectTrigger id={field.id}>
                  <SelectValue placeholder={`Select ${field.field_name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => {
                    // Extract value and label properly
                    const value = typeof option === 'string' ? option : option.value;
                    const label = typeof option === 'string' ? option : option.label;
                    
                    return (
                      <SelectItem key={value.toString()} value={value.toString()}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
