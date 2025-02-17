
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CustomFieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required"),
  field_type: z.enum(["text", "number", "boolean", "date"] as const),
  is_required: z.boolean().default(false),
});

type CustomField = {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  created_at: string;
};

export function CustomFieldsManager() {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof CustomFieldSchema>>({
    resolver: zodResolver(CustomFieldSchema),
    defaultValues: {
      field_name: "",
      field_type: "text",
      is_required: false,
    },
  });

  const fetchCustomFields = async () => {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch custom fields",
        variant: "destructive",
      });
    } else {
      setCustomFields(data || []);
    }
  };

  const onSubmit = async (values: z.infer<typeof CustomFieldSchema>) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("custom_fields")
      .insert({
        field_name: values.field_name,
        field_type: values.field_type,
        is_required: values.is_required,
        user_id: userId
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
      form.reset();
      fetchCustomFields();
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    const { error } = await supabase
      .from("custom_fields")
      .delete()
      .eq("id", fieldId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete custom field",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
      fetchCustomFields();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Fields</CardTitle>
        <CardDescription>Add custom fields to your deals</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    </SelectContent>
                  </Select>
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

            <Button type="submit">Add Custom Field</Button>
          </form>
        </Form>

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>{field.field_name}</TableCell>
                  <TableCell className="capitalize">{field.field_type}</TableCell>
                  <TableCell>{field.is_required ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(field.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ConfirmDialog
                      title="Delete Custom Field"
                      description={`Are you sure you want to delete the "${field.field_name}" field? This action cannot be undone and may affect existing deals using this field.`}
                      onConfirm={() => handleDeleteCustomField(field.id)}
                      triggerButton={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
