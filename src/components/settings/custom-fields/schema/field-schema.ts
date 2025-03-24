
import * as z from "zod";
import { CustomFieldType } from "@/types/custom-field";

export const ProductOptionSchema = z.object({
  product_id: z.string(),
  include_in_documents: z.boolean().default(true),
  display_price: z.boolean().default(true),
});

export const CustomFieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required"),
  field_type: z.enum(["text", "number", "boolean", "date", "product", "multi-select"]),
  is_required: z.boolean().default(false),
  default_value: z.any().optional(),
  allow_multiple: z.boolean().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  product_options: z.array(ProductOptionSchema).optional(),
  validation_rules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.string().optional()
  }).optional(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  include_in_documents: z.boolean().default(true),
});

export type CustomFieldFormData = z.infer<typeof CustomFieldSchema>;
export type ProductOption = z.infer<typeof ProductOptionSchema>;
