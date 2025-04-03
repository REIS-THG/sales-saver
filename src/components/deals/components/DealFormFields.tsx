
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DealFormFieldsProps {
  dealName: string;
  companyName: string;
  amount?: number;
  onDealNameChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onAmountChange: (value: number | undefined) => void;
}

export function DealFormFields({
  dealName,
  companyName,
  amount,
  onDealNameChange,
  onCompanyNameChange,
  onAmountChange,
}: DealFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="dealName">Deal Name</Label>
        <Input
          type="text"
          id="dealName"
          placeholder="Enter deal name"
          value={dealName}
          onChange={(e) => onDealNameChange(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          type="text"
          id="companyName"
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          type="number"
          id="amount"
          placeholder="Enter amount"
          value={amount !== undefined ? amount.toString() : ""}
          onChange={(e) => onAmountChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          required
        />
      </div>
    </>
  );
}
