
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UseFormReturn } from "react-hook-form";
import type { CustomFieldFormData } from "../schema/field-schema";
import type { Product } from "@/types/types";

interface ProductFieldSettingsProps {
  form: UseFormReturn<CustomFieldFormData>;
}

export function ProductFieldSettings({ form }: ProductFieldSettingsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "product_options",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userData.user.id);

        if (error) throw error;
        setProducts(data || []);

        // Initialize form with existing products if none are already set
        if (fields.length === 0 && data && data.length > 0) {
          data.forEach((product) => {
            append({ 
              product_id: product.id, 
              include_in_documents: true,
              display_price: true 
            });
          });
        }
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error fetching products",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [append, fields.length, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Product Options</Label>
        <p className="text-sm text-gray-500">
          Configure which products are available for selection and how they appear in documents
        </p>
      </div>

      {fields.length === 0 && products.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No products available. Please create products first to associate them with this field.
        </div>
      )}

      {fields.length === 0 && products.length > 0 && (
        <div className="text-sm text-gray-500 italic">
          No products configured. Add products to make them available for selection.
        </div>
      )}

      {fields.map((field, index) => {
        const product = products.find(p => p.id === field.product_id);
        return (
          <div key={field.id} className="border p-4 rounded-md space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{product?.name || "Unknown Product"}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`product_options.${index}.include_in_documents`}
                  checked={form.watch(`product_options.${index}.include_in_documents`)}
                  onCheckedChange={(checked) => 
                    form.setValue(`product_options.${index}.include_in_documents`, checked)
                  }
                />
                <Label htmlFor={`product_options.${index}.include_in_documents`}>
                  Include in generated documents
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`product_options.${index}.display_price`}
                  checked={form.watch(`product_options.${index}.display_price`)}
                  onCheckedChange={(checked) => 
                    form.setValue(`product_options.${index}.display_price`, checked)
                  }
                />
                <Label htmlFor={`product_options.${index}.display_price`}>
                  Display price in documents
                </Label>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center space-x-2">
        <Label>Add Product:</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            if (e.target.value) {
              // Check if this product is already added
              const alreadyAdded = fields.some(
                (field) => field.product_id === e.target.value
              );
              if (!alreadyAdded) {
                append({ 
                  product_id: e.target.value, 
                  include_in_documents: true,
                  display_price: true 
                });
              }
              e.target.value = ''; // Reset select after adding
            }
          }}
          value=""
        >
          <option value="">Select a product</option>
          {products
            .filter(
              (product) =>
                !fields.some((field) => field.product_id === product.id)
            )
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
        </select>
      </div>

      {products.length === 0 && (
        <div className="pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              // This would open a product creation modal in a real implementation
              toast({
                title: "Create Products First",
                description: "You need to create products before associating them with this field.",
              });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Product
          </Button>
        </div>
      )}
    </div>
  );
}
