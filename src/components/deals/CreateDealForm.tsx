
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";
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
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const CreateDealForm = ({ onDealCreated }: { onDealCreated: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDeal, setNewDeal] = useState({
    deal_name: "",
    company_name: "",
    company_url: "",
    amount: "",
    status: "open" as Deal["status"],
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "",
    notes: "",
    start_date: new Date().toISOString().split('T')[0],
    expected_close_date: "",
  });
  
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDates = () => {
    const start = new Date(newDeal.start_date);
    const end = new Date(newDeal.expected_close_date);
    const today = new Date();

    if (start > end) {
      return "Start date cannot be after expected close date";
    }
    if (start < today && start.toDateString() !== today.toDateString()) {
      return "Start date cannot be in the past";
    }
    return null;
  };

  const formatAmount = (value: string) => {
    const number = value.replace(/[^\d.]/g, '');
    const parts = number.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1] ? '.' + parts[1].slice(0, 2) : '';
    
    const formatted = Number(wholePart).toLocaleString('en-US') + decimalPart;
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setNewDeal({ ...newDeal, amount: formatted });
  };

  const handleCreateDeal = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!validateEmail(newDeal.contact_email)) {
        throw new Error("Please enter a valid email address");
      }

      const dateError = validateDates();
      if (dateError) {
        throw new Error(dateError);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const amountAsNumber = parseFloat(newDeal.amount.replace(/,/g, ''));
      if (isNaN(amountAsNumber)) {
        throw new Error("Please enter a valid amount");
      }

      const { error: insertError } = await supabase.from("deals").insert([
        {
          ...newDeal,
          amount: amountAsNumber,
          health_score: 50,
          user_id: user.id,
          custom_fields: null,
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Deal created successfully",
      });

      setNewDeal({
        deal_name: "",
        company_name: "",
        company_url: "",
        amount: "",
        status: "open",
        contact_first_name: "",
        contact_last_name: "",
        contact_email: "",
        notes: "",
        start_date: new Date().toISOString().split('T')[0],
        expected_close_date: "",
      });
      
      onDealCreated();
    } catch (err) {
      console.error("Error creating deal:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create deal";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Create Deal
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Deal</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="deal_name">Deal Name</Label>
            <Input
              id="deal_name"
              value={newDeal.deal_name}
              onChange={(e) =>
                setNewDeal({ ...newDeal, deal_name: e.target.value })
              }
              placeholder="Enter deal name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={newDeal.company_name}
              onChange={(e) =>
                setNewDeal({ ...newDeal, company_name: e.target.value })
              }
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_url">Company URL</Label>
            <Input
              id="company_url"
              type="url"
              value={newDeal.company_url}
              onChange={(e) =>
                setNewDeal({ ...newDeal, company_url: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              value={newDeal.amount}
              onChange={handleAmountChange}
              placeholder="Enter deal amount"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_first_name">Contact First Name</Label>
              <Input
                id="contact_first_name"
                value={newDeal.contact_first_name}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, contact_first_name: e.target.value })
                }
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_last_name">Contact Last Name</Label>
              <Input
                id="contact_last_name"
                value={newDeal.contact_last_name}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, contact_last_name: e.target.value })
                }
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={newDeal.contact_email}
              onChange={(e) =>
                setNewDeal({ ...newDeal, contact_email: e.target.value })
              }
              placeholder="contact@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newDeal.notes}
              onChange={(e) =>
                setNewDeal({ ...newDeal, notes: e.target.value })
              }
              placeholder="Add any notes about this deal..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={newDeal.start_date}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Expected Close Date</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={newDeal.expected_close_date}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, expected_close_date: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={newDeal.status}
              onValueChange={(value: Deal["status"]) =>
                setNewDeal({ ...newDeal, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="stalled">Stalled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full mt-4"
            onClick={handleCreateDeal}
            disabled={isSubmitting || !newDeal.deal_name || !newDeal.company_name || !newDeal.amount}
          >
            Create Deal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateDealForm;
