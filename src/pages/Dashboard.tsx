
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  LogOut,
  Plus,
} from "lucide-react";

const Dashboard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeal, setNewDeal] = useState({
    deal_name: "",
    company_name: "",
    amount: "",
    status: "open" as Deal["status"],
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "",
    source: "",
    start_date: new Date().toISOString().split('T')[0],
    expected_close_date: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDeals = async () => {
    const { data: dealsData, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deals:", error);
      return;
    }

    const typedDeals = (dealsData || []).map((deal) => ({
      id: deal.id,
      user_id: deal.user_id,
      deal_name: deal.deal_name,
      company_name: deal.company_name,
      amount: deal.amount,
      status: deal.status as Deal["status"],
      health_score: deal.health_score || 50,
      last_contacted: deal.last_contacted || null,
      next_action: deal.next_action || null,
      created_at: deal.created_at,
      updated_at: deal.updated_at,
      contact_first_name: deal.contact_first_name || "",
      contact_last_name: deal.contact_last_name || "",
      contact_email: deal.contact_email || "",
      source: deal.source || "",
      start_date: deal.start_date || new Date().toISOString(),
      expected_close_date: deal.expected_close_date || "",
      custom_fields: deal.custom_fields as Record<string, string | number | boolean> | null,
    }));

    setDeals(typedDeals);
    setLoading(false);
  };

  const formatAmount = (value: string) => {
    // Remove all non-numeric characters
    const number = value.replace(/[^0-9.]/g, '');
    // Convert to number and format with commas
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(number) || 0);
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setNewDeal({ ...newDeal, amount: formatted });
  };

  const handleCreateDeal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Remove commas and convert to number for storage
      const amountAsNumber = parseFloat(newDeal.amount.replace(/,/g, ''));

      const { error } = await supabase.from("deals").insert([
        {
          ...newDeal,
          amount: amountAsNumber,
          health_score: 50,
          user_id: user.id,
          custom_fields: {},
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal created successfully",
      });

      setNewDeal({
        deal_name: "",
        company_name: "",
        amount: "",
        status: "open",
        contact_first_name: "",
        contact_last_name: "",
        contact_email: "",
        source: "",
        start_date: new Date().toISOString().split('T')[0],
        expected_close_date: "",
      });
      
      fetchDeals();
    } catch (error) {
      console.error("Error creating deal:", error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Deal["status"]) => {
    switch (status) {
      case "won":
        return <CheckCircle2 className="text-green-500" />;
      case "lost":
        return <Ban className="text-red-500" />;
      case "stalled":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return <Clock className="text-blue-500" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <div className="flex items-center gap-4">
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
                    <Label htmlFor="source">Deal Source</Label>
                    <Input
                      id="source"
                      value={newDeal.source}
                      onChange={(e) =>
                        setNewDeal({ ...newDeal, source: e.target.value })
                      }
                      placeholder="How did you find this deal?"
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
                    disabled={
                      !newDeal.deal_name ||
                      !newDeal.company_name ||
                      !newDeal.amount ||
                      !newDeal.contact_first_name ||
                      !newDeal.contact_last_name ||
                      !newDeal.contact_email
                    }
                  >
                    Create Deal
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{deal.deal_name}</CardTitle>
                {getStatusIcon(deal.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    <p className="text-sm text-gray-500">Health Score</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(
                        deal.health_score
                      )}`}
                    >
                      {deal.health_score}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
