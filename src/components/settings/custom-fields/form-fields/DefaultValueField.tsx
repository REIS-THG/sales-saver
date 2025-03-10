
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CustomFieldFormData } from "../schema/field-schema";

interface DefaultValueFieldProps {
  form: UseFormReturn<CustomFieldFormData>;
  fieldType: string;
}

export function DefaultValueField({ form, fieldType }: DefaultValueFieldProps) {
  if (fieldType !== "text" && fieldType !== "number") {
    return null;
  }

  return (
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
  );
}
