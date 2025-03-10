
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldOption, CustomFieldValidation, CustomField, CustomFieldType } from "@/types/custom-field";
import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

const CustomFieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required"),
  field_type: z.enum(["text", "number", "boolean", "date", "product", "multi-select"]),
  is_required: z.boolean().default(false),
  default_value: z.any().optional(),
  allow_multiple: z.boolean().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.string().optional()
  }).optional(),
  placeholder: z.string().optional(),
  help_text: z.string().optional()
});

export type CustomFieldFormData = z.infer<typeof CustomFieldSchema>;

interface CustomFieldFormProps {
  onSubmit: (data: CustomFieldFormData) => void;
  initialData?: Partial<CustomField>;
}

export function CustomFieldForm({ onSubmit, initialData }: CustomFieldFormProps) {
  const [showOptions, setShowOptions] = useState(false);

  const form = useForm<CustomFieldFormData>({
    resolver: zodResolver(CustomFieldSchema),
    defaultValues: {
      field_name: initialData?.field_name || "",
      field_type: (initialData?.field_type as CustomFieldType) || "text",
      is_required: initialData?.is_required || false,
      allow_multiple: initialData?.allow_multiple || false,
      options: initialData?.options || [],
      validation_rules: initialData?.validation_rules || {},
      default_value: initialData?.default_value || "",
      placeholder: initialData?.placeholder || "",
      help_text: initialData?.help_text || ""
    },
  });

  const fieldType = form.watch("field_type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Industry Type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="field_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="multi-select">Multi Select</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(fieldType === "text" || fieldType === "number") && (
          <FormField
            control={form.control}
            name="default_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input 
                    type={fieldType === "number" ? "number" : "text"}
                    placeholder="Enter default value"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {fieldType === "multi-select" && (
          <FormField
            control={form.control}
            name="options"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Options</FormLabel>
                <div className="space-y-2">
                  {field.value?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Option label"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(field.value || [])];
                          newOptions[index] = {
                            ...newOptions[index],
                            label: e.target.value,
                            value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                          };
                          field.onChange(newOptions);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = [...(field.value || [])];
                          newOptions.splice(index, 1);
                          field.onChange(newOptions);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      field.onChange([...(field.value || []), { label: "", value: "" }]);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="allow_multiple"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Allow Multiple Values</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_required"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Required Field</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="help_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Help Text</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter help text for this field"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This text will be shown to users as a hint when filling out this field
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">{initialData ? "Update" : "Add"} Custom Field</Button>
          {initialData && <Button type="button" variant="outline" onClick={() => onSubmit(form.getValues())}>Cancel</Button>}
        </div>
      </form>
    </Form>
  );
}
