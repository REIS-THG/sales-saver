
import type { CustomField } from "@/types/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CustomFieldsSection } from "./components/CustomFieldsSection";
import { ContactSection } from "./components/ContactSection";
import { useCreateDeal } from "./hooks/useCreateDeal";
import type { Deal } from "@/types/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const createDealSchema = z.object({
  deal_name: z.string().min(1, "Deal name is required"),
  company_name: z.string().min(1, "Company name is required"),
  company_url: z.string().url().optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{0,2})?$/, "Invalid amount format"),
  contact_first_name: z.string().min(1, "First name is required"),
  contact_last_name: z.string().min(1, "Last name is required"),
  contact_email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  expected_close_date: z.string().min(1, "Expected close date is required"),
  status: z.enum(["open", "won", "lost", "stalled"] as const),
  team_id: z.string().optional().nullable(),
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

type CreateDealFormData = z.infer<typeof createDealSchema>;

interface CreateDealFormProps {
  onDealCreated: () => void;
  customFields: CustomField[];
  onBeforeCreate?: () => Promise<boolean>;
  trigger?: React.ReactNode;
}

const CreateDealForm = ({ onDealCreated, customFields, onBeforeCreate, trigger }: CreateDealFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isSubmitting,
    error,
    teams,
    handleSubmit: handleDealSubmit
  } = useCreateDeal(onDealCreated, onBeforeCreate);

  const form = useForm<CreateDealFormData>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      deal_name: "",
      company_name: "",
      company_url: "",
      amount: "",
      contact_first_name: "",
      contact_last_name: "",
      contact_email: "",
      notes: "",
      start_date: new Date().toISOString().split('T')[0],
      expected_close_date: "",
      status: "open",
      team_id: null,
      custom_fields: {},
    },
  });

  const onSubmit = async (data: CreateDealFormData) => {
    try {
      await handleDealSubmit(data);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Create Deal
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Deal</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="deal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter deal name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {teams.length > 0 && (
              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter company name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter deal amount" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="stalled">Stalled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about this deal..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CustomFieldsSection
              customFields={customFields}
              values={form.getValues().custom_fields}
              onChange={(fieldName, value) => {
                const currentCustomFields = form.getValues().custom_fields;
                form.setValue('custom_fields', {
                  ...currentCustomFields,
                  [fieldName]: value
                });
              }}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateDealForm;
