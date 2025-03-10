
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CustomFieldFormData } from "../schema/field-schema";

interface HelpTextFieldProps {
  form: UseFormReturn<CustomFieldFormData>;
}

export function HelpTextField({ form }: HelpTextFieldProps) {
  return (
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
  );
}
