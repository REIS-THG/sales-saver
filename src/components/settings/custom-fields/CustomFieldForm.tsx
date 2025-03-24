
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { CustomField } from "@/types/custom-field";
import { CustomFieldSchema, CustomFieldFormData } from "./schema/field-schema";
import { BasicFieldSettings } from "./form-fields/BasicFieldSettings";
import { DefaultValueField } from "./form-fields/DefaultValueField";
import { OptionsField } from "./form-fields/OptionsField";
import { FieldFlags } from "./form-fields/FieldFlags";
import { HelpTextField } from "./form-fields/HelpTextField";
import { ProductFieldSettings } from "./form-fields/ProductFieldSettings";

interface CustomFieldFormProps {
  onSubmit: (data: CustomFieldFormData) => void;
  initialData?: Partial<CustomField>;
}

export function CustomFieldForm({ onSubmit, initialData }: CustomFieldFormProps) {
  const form = useForm<CustomFieldFormData>({
    resolver: zodResolver(CustomFieldSchema),
    defaultValues: {
      field_name: initialData?.field_name || "",
      field_type: initialData?.field_type || "text",
      is_required: initialData?.is_required || false,
      allow_multiple: initialData?.allow_multiple || false,
      options: initialData?.options || [],
      product_options: initialData?.product_options || [],
      validation_rules: initialData?.validation_rules || {},
      default_value: initialData?.default_value || "",
      placeholder: initialData?.placeholder || "",
      help_text: initialData?.help_text || "",
      include_in_documents: initialData?.include_in_documents !== false,
    },
  });

  const fieldType = form.watch("field_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicFieldSettings form={form} />
        
        <DefaultValueField form={form} fieldType={fieldType} />
        
        {fieldType === "multi-select" && (
          <OptionsField form={form} fieldType={fieldType} />
        )}
        
        {fieldType === "product" && (
          <ProductFieldSettings form={form} />
        )}
        
        <FieldFlags form={form} />
        
        <HelpTextField form={form} />

        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Button type="submit">{initialData ? "Update" : "Add"} Custom Field</Button>
          </div>
          
          {initialData && (
            <Button type="button" variant="outline" onClick={() => onSubmit(form.getValues())}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
