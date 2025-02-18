
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { CustomField } from "@/types/types";

interface CustomFieldsSectionProps {
  customFields: CustomField[];
  values: Record<string, string | number | boolean>;
  onChange: (fieldName: string, value: string | number | boolean) => void;
}

export const CustomFieldsSection = ({
  customFields,
  values,
  onChange,
}: CustomFieldsSectionProps) => {
  if (customFields.length === 0) return null;

  return (
    <>
      <Separator className="my-4" />
      <h3 className="text-sm font-medium mb-2">Custom Fields</h3>
      <div className="space-y-4">
        {customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_name}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.field_type === "text" && (
              <Input
                id={field.field_name}
                value={values[field.field_name] as string || ""}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
              />
            )}
            {field.field_type === "number" && (
              <Input
                id={field.field_name}
                type="number"
                value={values[field.field_name] as number || ""}
                onChange={(e) => onChange(field.field_name, parseFloat(e.target.value))}
                required={field.is_required}
              />
            )}
            {field.field_type === "boolean" && (
              <Switch
                id={field.field_name}
                checked={values[field.field_name] as boolean || false}
                onCheckedChange={(checked) => onChange(field.field_name, checked)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
