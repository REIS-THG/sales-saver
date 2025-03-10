
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CustomFieldFormData } from "../schema/field-schema";

interface OptionsFieldProps {
  form: UseFormReturn<CustomFieldFormData>;
  fieldType: string;
}

export function OptionsField({ form, fieldType }: OptionsFieldProps) {
  if (fieldType !== "multi-select") {
    return null;
  }

  return (
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
  );
}
