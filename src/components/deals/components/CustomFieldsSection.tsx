
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CustomField, CustomFieldOption, Product } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*');
        
        if (!error && productsData) {
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
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
                placeholder={field.placeholder || ""}
              />
            )}
            {field.field_type === "number" && (
              <Input
                id={field.field_name}
                type="number"
                value={values[field.field_name] as number || ""}
                onChange={(e) => onChange(field.field_name, parseFloat(e.target.value))}
                required={field.is_required}
                placeholder={field.placeholder || ""}
              />
            )}
            {field.field_type === "boolean" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id={field.field_name}
                  checked={values[field.field_name] as boolean || false}
                  onCheckedChange={(checked) => onChange(field.field_name, checked)}
                />
                <Label htmlFor={field.field_name} className="text-sm font-normal">
                  {values[field.field_name] ? "Yes" : "No"}
                </Label>
              </div>
            )}
            {field.field_type === "date" && (
              <Input
                id={field.field_name}
                type="date"
                value={values[field.field_name] as string || ""}
                onChange={(e) => onChange(field.field_name, e.target.value)}
                required={field.is_required}
              />
            )}
            {field.field_type === "product" && (
              <div className="space-y-2">
                <Select
                  value={values[field.field_name] as string || ""}
                  onValueChange={(value) => onChange(field.field_name, value)}
                  disabled={isLoading}
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
                
                {values[field.field_name] && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {(() => {
                      const selectedProduct = products.find(p => p.id === values[field.field_name]);
                      if (!selectedProduct) return null;
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{selectedProduct.name}</h4>
                            {selectedProduct.price && (
                              <Badge variant="outline">
                                {formatCurrency(selectedProduct.price)}
                              </Badge>
                            )}
                          </div>
                          {selectedProduct.description && (
                            <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
            {field.field_type === "multi-select" && field.options && (
              <Select
                value={values[field.field_name] as string || ""}
                onValueChange={(value) => onChange(field.field_name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.help_text && (
              <p className="text-xs text-gray-500">{field.help_text}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
