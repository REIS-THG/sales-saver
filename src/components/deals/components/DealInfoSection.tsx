
import { Deal } from "@/types/types";

interface DealInfoSectionProps {
  deal: Deal;
}

export const DealInfoSection = ({ deal }: DealInfoSectionProps) => {
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Company</p>
          <p className="font-medium break-all">{deal.company_name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium">
            ${Number(deal.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Contact</p>
          <p className="font-medium break-all">{`${deal.contact_first_name} ${deal.contact_last_name}`}</p>
          <p className="text-sm text-gray-500 break-all">{deal.contact_email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Dates</p>
          <p className="font-medium">
            Start: {deal.start_date ? new Date(deal.start_date).toLocaleDateString() : 'N/A'}
          </p>
          {deal.expected_close_date && (
            <p className="font-medium">
              Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {deal.next_action && (
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Next Action</p>
          <p className="font-medium break-all">{deal.next_action}</p>
        </div>
      )}
    </div>
  );
};
