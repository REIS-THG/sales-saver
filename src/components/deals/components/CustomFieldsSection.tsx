
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CustomField, Product } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";

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
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*');
      
      if (!error && productsData) {
        setProducts(productsData);
      }
    };

    fetchProducts();
  }, []);

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
            {field.field_type === "product" && (
              <Select
                value={values[field.field_name] as string || ""}
                onValueChange={(value) => onChange(field.field_name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
