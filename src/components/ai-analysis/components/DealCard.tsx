
import React from "react";
import { Deal } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, Building2, DollarSign, User, Clock } from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Deal Name</h3>
            <p className="text-base font-medium mt-1">{deal.deal_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Company</h3>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 text-gray-400" />
              <p className="text-base">{deal.company_name}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Value</h3>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <p className="text-base">${deal.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact</h3>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-base">{deal.contact_first_name} {deal.contact_last_name}</p>
              </div>
              {deal.contact_email && (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{deal.contact_email}</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={
                deal.status === 'won' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                deal.status === 'lost' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                deal.status === 'stalled' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }>
                {deal.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dates</h3>
            <div className="space-y-1 mt-1">
              {deal.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">Start: {new Date(deal.start_date).toLocaleDateString()}</p>
                </div>
              )}
              {deal.expected_close_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-sm">Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {deal.notes && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">{deal.notes}</p>
        </div>
      )}
    </div>
  );
}
