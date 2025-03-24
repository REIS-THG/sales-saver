
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowUpRight, DollarSign, BarChart2, Users, GripVertical } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Deal, DealInsight, User } from "@/types/types";

// Widget component that can be dragged and reordered
const SortableWidget = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
      {children}
    </div>
  );
};

// DashboardSummaryWidget component for showing summary stats
const DashboardSummaryWidget = ({ 
  deals, 
  isLoading, 
  error 
}: { 
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard summary: {error}</AlertDescription>
      </Alert>
    );
  }

  // Calculate statistics
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const wonDeals = deals.filter(deal => deal.status === 'won').length;
  const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Deal Summary</CardTitle>
        <CardDescription>Overview of your sales pipeline</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Total Deals</span>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-blue-500" />
            <span className="text-2xl font-bold">{totalDeals}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Total Value</span>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
            <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Won Deals</span>
          <div className="flex items-center">
            <ArrowUpRight className="mr-2 h-4 w-4 text-emerald-500" />
            <span className="text-2xl font-bold">{wonDeals}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-muted-foreground">Avg Deal Size</span>
          <div className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4 text-purple-500" />
            <span className="text-2xl font-bold">${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// RecentActivityWidget component for showing recent activity
const RecentActivityWidget = ({ 
  deals, 
  isLoading, 
  error 
}: { 
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load recent activity: {error}</AlertDescription>
      </Alert>
    );
  }
  
  // Sort deals by updated_at date, most recent first
  const recentDeals = [...deals]
    .sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest updates in your pipeline</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentDeals.length > 0 ? (
          recentDeals.map(deal => (
            <div key={deal.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{deal.deal_name}</p>
                <p className="text-sm text-muted-foreground">{deal.company_name}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  deal.status === 'won' ? 'bg-green-100 text-green-800' : 
                  deal.status === 'lost' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {deal.status}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {deal.updated_at ? new Date(deal.updated_at).toLocaleDateString() : 'No date'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardWidgetsProps {
  deals: Deal[];
  userData: User | null;
  loading: boolean;
  error: string | null;
}

export function DashboardWidgets({ deals, userData, loading, error }: DashboardWidgetsProps) {
  // Define widget configuration with ids for drag and drop
  const [widgets, setWidgets] = useState([
    { id: "summary", component: DashboardSummaryWidget },
    { id: "recent", component: RecentActivityWidget },
  ]);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end to reorder widgets
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
          {widgets.map(widget => (
            <SortableWidget key={widget.id} id={widget.id}>
              <widget.component 
                deals={deals} 
                isLoading={loading} 
                error={error} 
              />
            </SortableWidget>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
