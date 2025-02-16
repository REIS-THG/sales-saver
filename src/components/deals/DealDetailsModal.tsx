
import { type Deal } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DealDetailsModalProps {
  deal: Deal | null;
  onClose: () => void;
}

const DealDetailsModal = ({ deal, onClose }: DealDetailsModalProps) => {
  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{deal.deal_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium">{deal.company_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">
              ${Number(deal.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact</p>
            <p className="font-medium">{`${deal.contact_first_name} ${deal.contact_last_name}`}</p>
            <p className="text-sm text-gray-500">{deal.contact_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <p className="font-medium">{deal.source || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dates</p>
            <p className="font-medium">
              Start: {new Date(deal.start_date).toLocaleDateString()}
            </p>
            {deal.expected_close_date && (
              <p className="font-medium">
                Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}
              </p>
            )}
          </div>
          {deal.next_action && (
            <div>
              <p className="text-sm text-gray-500">Next Action</p>
              <p className="font-medium">{deal.next_action}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
