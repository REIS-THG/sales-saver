
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Deal } from "@/types/types";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{deal.deal_name}</CardTitle>
        <CardDescription>
          Company: {deal.company_name} | Value: ${deal.amount.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Deal Status</h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                deal.status === 'won' ? 'bg-green-100 text-green-800' :
                deal.status === 'lost' ? 'bg-red-100 text-red-800' :
                deal.status === 'stalled' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {deal.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Health Score: {deal.health_score}%
              </span>
            </div>
          </div>
          
          {deal.contact_first_name && (
            <div>
              <h4 className="font-medium mb-2">Contact Information</h4>
              <p className="text-sm text-gray-600">
                {deal.contact_first_name} {deal.contact_last_name}
                {deal.contact_email && (
                  <span className="block text-gray-500">{deal.contact_email}</span>
                )}
              </p>
            </div>
          )}

          {deal.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{deal.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
