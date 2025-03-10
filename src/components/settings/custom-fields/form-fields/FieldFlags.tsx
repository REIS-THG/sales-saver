
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { CustomFieldFormData } from "../schema/field-schema";

interface FieldFlagsProps {
  form: UseFormReturn<CustomFieldFormData>;
}

export function FieldFlags({ form }: FieldFlagsProps) {
  return (
    <>
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
    </>
  );
}
