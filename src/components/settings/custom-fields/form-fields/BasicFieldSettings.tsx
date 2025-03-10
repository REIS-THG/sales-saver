
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CustomFieldFormData } from "../schema/field-schema";

interface BasicFieldSettingsProps {
  form: UseFormReturn<CustomFieldFormData>;
}

export function BasicFieldSettings({ form }: BasicFieldSettingsProps) {
  return (
    <>
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
    </>
  );
}
