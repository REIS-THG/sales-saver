
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Deal, User } from "@/types/types";
import { DollarSign, Calendar, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardWidgetsSectionProps {
  deals: Deal[];
  userData: User | null;
  loading: boolean;
  error: string | null;
  teamName?: string;
}

export function DashboardWidgetsSection({
  deals,
  userData,
  loading,
  error,
  teamName
}: DashboardWidgetsSectionProps) {
  const isMobile = useIsMobile();
  
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const openDeals = deals.filter(deal => deal.status === 'open').length;
  const wonDeals = deals.filter(deal => deal.status === 'won').length;
  const lostDeals = deals.filter(deal => deal.status === 'lost').length;
  
  // Calculate deals closing this month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dealsClosingThisMonth = deals.filter(deal => {
    if (!deal.expected_close_date) return false;
    const closeDate = new Date(deal.expected_close_date);
    return closeDate <= endOfMonth && deal.status === 'open';
  }).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-gray-50">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${isMobile ? 'px-2' : ''}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {teamName ? `${teamName}'s Pipeline` : 'Your Pipeline'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalDeals}</div>
              <p className="text-xs text-muted-foreground">
                {openDeals} open · {wonDeals} won · {lostDeals} lost
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {userData?.subscription_status === 'pro' ? 'Pro account' : 'Free account'}
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Closing This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{dealsClosingThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((dealsClosingThisMonth / Math.max(openDeals, 1)) * 100)}% of open deals
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {deals.length === 0 ? '0%' : `${Math.round((wonDeals / deals.length) * 100)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {wonDeals} won out of {totalDeals} deals
              </p>
            </div>
            <div className={`p-2 rounded-full ${
              (wonDeals / Math.max(deals.length, 1)) * 100 > 50 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
            }`}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
