
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
import { CustomField } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CustomFieldsSection } from "./components/CustomFieldsSection";

interface DealCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: () => Promise<void>;
  customFields: CustomField[];
  onBeforeCreate?: () => Promise<boolean>;
  teamId?: string;
}

const formSchema = z.object({
  deal_name: z.string().min(1, "Deal name is required"),
  company_name: z.string().min(1, "Company name is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  expected_close_date: z.date().optional(),
  contact_first_name: z.string().optional(),
  contact_last_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  company_url: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const DealCreateModal = ({
  open,
  onOpenChange,
  onDealCreated,
  customFields,
  onBeforeCreate,
  teamId
}: DealCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { handleError, handleSuccess } = useApiError();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deal_name: "",
      company_name: "",
      amount: 0,
      contact_first_name: "",
      contact_last_name: "",
      contact_email: "",
      company_url: "",
      notes: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);

      if (onBeforeCreate) {
        const canProceed = await onBeforeCreate();
        if (!canProceed) {
          setIsSubmitting(false);
          return;
        }
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        handleError(new Error("User not authenticated"), "Authentication Error");
        return;
      }

      const { data, error } = await supabase.from("deals").insert([
        {
          ...values,
          user_id: user.user.id,
          team_id: teamId || null,
          status: "open",
          custom_fields: customFieldValues,
        },
      ]);

      if (error) {
        handleError(error, "Failed to create deal");
        return;
      }

      handleSuccess("Deal created successfully");
      form.reset();
      setCustomFieldValues({});
      await onDealCreated();
      onOpenChange(false);
    } catch (err) {
      console.error("Error creating deal:", err);
      handleError(err instanceof Error ? err : new Error("Unknown error"), "Failed to create deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>
            Enter the details for your new deal{teamId ? " (Team Deal)" : ""}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Enterprise SaaS Solution"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Acme Inc." {...field} />
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
                    <FormLabel>Deal Amount*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        min={0}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_close_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Close Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
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
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add any relevant notes here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {customFields.length > 0 && (
              <CustomFieldsSection
                customFields={customFields}
                values={customFieldValues}
                onChange={setCustomFieldValues}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Deal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DealCreateModal;
