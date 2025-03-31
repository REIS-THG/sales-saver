import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomFieldFormData } from "../schema/field-schema";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ProductFieldSettingsProps {
  form: UseFormReturn<CustomFieldFormData>;
}

export function ProductFieldSettings({ form }: ProductFieldSettingsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const productOptions = form.watch("product_options") || [];

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // Fetch products from the database
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching products:", error);
          return;
        }

        setProducts(data || []);

        // Initialize selected products from form data
        const initialSelectedIds = productOptions.map(po => po.product_id);
        setSelectedProductIds(initialSelectedIds);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Update form when selections change
  useEffect(() => {
    const newProductOptions = selectedProductIds.map(productId => {
      // Check if this product already has options in the form
      const existingOption = productOptions.find(po => po.product_id === productId);
      
      // If it exists, keep its settings, otherwise use defaults
      return existingOption || {
        product_id: productId,
        include_in_documents: true,
        display_price: true
      };
    });
    
    form.setValue("product_options", newProductOptions);
  }, [selectedProductIds, form]);

  const handleProductToggle = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  const handleOptionChange = (productId: string, field: 'include_in_documents' | 'display_price', value: boolean) => {
    const newOptions = productOptions.map(option => {
      if (option.product_id === productId) {
        return { ...option, [field]: value };
      }
      return option;
    });
    
    form.setValue("product_options", newOptions);
  };

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-muted-foreground">No products found in your database.</p>
        <p className="text-sm mt-2">Products will appear here once they are added to your system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Select Products to Track</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose which products this custom field will track in deals
        </p>
      </div>

      <div className="space-y-3">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={(checked) => handleProductToggle(product.id, checked === true)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor={`product-${product.id}`} className="font-medium cursor-pointer">
                      {product.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {selectedProductIds.includes(product.id) && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <Label htmlFor={`include-docs-${product.id}`} className="text-xs">
                        Include in documents
                      </Label>
                      <Switch
                        id={`include-docs-${product.id}`}
                        checked={productOptions.find(p => p.product_id === product.id)?.include_in_documents ?? true}
                        onCheckedChange={(checked) => handleOptionChange(product.id, 'include_in_documents', checked)}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Label htmlFor={`display-price-${product.id}`} className="text-xs">
                        Display price
                      </Label>
                      <Switch
                        id={`display-price-${product.id}`}
                        checked={productOptions.find(p => p.product_id === product.id)?.display_price ?? true}
                        onCheckedChange={(checked) => handleOptionChange(product.id, 'display_price', checked)}
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
