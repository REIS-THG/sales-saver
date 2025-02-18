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
import { formatAmount, validateEmail, validateDates } from "./utils/form-validation";
import { CustomFieldsSection } from "./components/CustomFieldsSection";
import { ContactSection } from "./components/ContactSection";
import { useCreateDeal } from "./hooks/useCreateDeal";
import type { Deal } from "@/types/types";
import { useState } from "react";

interface CreateDealFormProps {
  onDealCreated: () => void;
  customFields: CustomField[];
  onBeforeCreate?: () => Promise<boolean>;
  trigger?: React.ReactNode;
}

const CreateDealForm = ({ onDealCreated, customFields, onBeforeCreate, trigger }: CreateDealFormProps) => {
  const {
    isSubmitting,
    error,
    teams,
    newDeal,
    setNewDeal,
    handleSubmit
  } = useCreateDeal(onDealCreated, onBeforeCreate);

  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    email?: string;
    dates?: string;
  }>({});

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setNewDeal({ ...newDeal, amount: formatted });
    
    // Clear amount error when user types
    setValidationErrors(prev => ({ ...prev, amount: undefined }));
    
    // Validate amount format
    if (e.target.value && !formatted) {
      setValidationErrors(prev => ({ 
        ...prev, 
        amount: "Please enter a valid amount" 
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setNewDeal({ ...newDeal, contact_email: value });
    setValidationErrors(prev => ({ ...prev, email: undefined }));
    
    if (value && !validateEmail(value)) {
      setValidationErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
    }
  };

  const handleDateChange = (field: 'start_date' | 'expected_close_date', value: string) => {
    setNewDeal({ ...newDeal, [field]: value });
    setValidationErrors(prev => ({ ...prev, dates: undefined }));
    
    if (field === 'expected_close_date' && newDeal.start_date) {
      const dateError = validateDates(newDeal.start_date, value);
      if (dateError) {
        setValidationErrors(prev => ({
          ...prev,
          dates: dateError
        }));
      }
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: string | number | boolean) => {
    setNewDeal(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: value
      }
    }));
  };

  return (
    <Sheet>
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
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="deal_name">
              Deal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deal_name"
              value={newDeal.deal_name}
              onChange={(e) =>
                setNewDeal({ ...newDeal, deal_name: e.target.value })
              }
              placeholder="Enter deal name"
            />
          </div>

          {teams.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={newDeal.team_id || ""}
                onValueChange={(value) =>
                  setNewDeal({ ...newDeal, team_id: value || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="company_name">
              Company Name <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="amount">
              Amount ($) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              value={newDeal.amount}
              onChange={handleAmountChange}
              placeholder="Enter deal amount"
              className={validationErrors.amount ? "border-red-500" : ""}
            />
            {validationErrors.amount && (
              <p className="text-sm text-red-500">{validationErrors.amount}</p>
            )}
          </div>

          <ContactSection
            firstName={newDeal.contact_first_name}
            lastName={newDeal.contact_last_name}
            email={newDeal.contact_email}
            emailError={validationErrors.email}
            onFirstNameChange={(value) =>
              setNewDeal({ ...newDeal, contact_first_name: value })
            }
            onLastNameChange={(value) =>
              setNewDeal({ ...newDeal, contact_last_name: value })
            }
            onEmailChange={handleEmailChange}
            required={true}
          />

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
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={newDeal.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className={validationErrors.dates ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">
                Expected Close Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expected_close_date"
                type="date"
                value={newDeal.expected_close_date}
                onChange={(e) => handleDateChange('expected_close_date', e.target.value)}
                className={validationErrors.dates ? "border-red-500" : ""}
              />
            </div>
            {validationErrors.dates && (
              <p className="text-sm text-red-500 col-span-2">{validationErrors.dates}</p>
            )}
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

          <CustomFieldsSection
            customFields={customFields}
            values={newDeal.custom_fields}
            onChange={handleCustomFieldChange}
          />

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !newDeal.deal_name || 
              !newDeal.company_name || 
              !newDeal.amount ||
              !newDeal.expected_close_date ||
              !!validationErrors.amount ||
              !!validationErrors.email ||
              !!validationErrors.dates
            }
          >
            {isSubmitting ? "Creating..." : "Create Deal"}
          </Button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateDealForm;
