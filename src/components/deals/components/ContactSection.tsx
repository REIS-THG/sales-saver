
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContactSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  emailError?: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  required?: boolean;
}

export const ContactSection = ({
  firstName,
  lastName,
  email,
  emailError,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  required,
}: ContactSectionProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_first_name">
            Contact First Name {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="contact_first_name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_last_name">
            Contact Last Name {required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="contact_last_name"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_email">
          Contact Email {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="contact_email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="contact@company.com"
          className={emailError ? "border-red-500" : ""}
        />
        {emailError && (
          <p className="text-sm text-red-500">{emailError}</p>
        )}
      </div>
    </>
  );
};
