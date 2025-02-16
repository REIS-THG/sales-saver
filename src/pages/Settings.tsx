import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Upload,
  User as UserIcon,
  Mail,
  Lock,
  CreditCard,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { User } from "@/types/types";

const CustomFieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required"),
  field_type: z.enum(["text", "number", "boolean", "date"] as const),
  is_required: z.boolean().default(false),
});

const Settings = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [imports, setImports] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [theme, setTheme] = useState("light");
  const [defaultView, setDefaultView] = useState("table");
  const [userData, setUserData] = useState<User | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof CustomFieldSchema>>({
    resolver: zodResolver(CustomFieldSchema),
    defaultValues: {
      field_name: "",
      field_type: "text",
      is_required: false,
    },
  });

  useEffect(() => {
    fetchCustomFields();
    fetchUserPreferences();
    fetchUserProfile();
  }, []);

  const fetchCustomFields = async () => {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch custom fields",
        variant: "destructive",
      });
    } else {
      setCustomFields(data || []);
    }
  };

  const fetchUserPreferences = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("theme, default_deal_view")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to fetch user preferences",
        variant: "destructive",
      });
      return;
    }

    if (!userData) {
      const { error: createError } = await supabase
        .from("users")
        .insert({
          user_id: userId,
          full_name: authData.user?.email?.split('@')[0] || 'User',
          theme: 'light',
          default_deal_view: 'table',
          role: 'sales_rep'
        });

      if (createError) {
        toast({
          title: "Error",
          description: "Failed to create user preferences",
          variant: "destructive",
        });
        return;
      }

      setTheme('light');
      setDefaultView('table');
    } else {
      setTheme(userData.theme || "light");
      setDefaultView(userData.default_deal_view || "table");
    }
  };

  const fetchUserProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: userDataResult, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
      return;
    }

    setUserData(userDataResult);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import-deals', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      toast({
        title: "Success",
        description: "File uploaded successfully. Processing will begin shortly.",
      });

      const { data: newImports } = await supabase
        .from('bulk_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (newImports) {
        setImports(newImports);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmitCustomField = async (values: z.infer<typeof CustomFieldSchema>) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("custom_fields")
      .insert({
        field_name: values.field_name,
        field_type: values.field_type,
        is_required: values.is_required,
        user_id: userId
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
      form.reset();
      fetchCustomFields();
    }
  };

  const updateTheme = async (newTheme: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ theme: newTheme })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update theme preference",
        variant: "destructive",
      });
    } else {
      setTheme(newTheme);
      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    }
  };

  const updateDefaultView = async (newView: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ default_deal_view: newView })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update default view",
        variant: "destructive",
      });
    } else {
      setDefaultView(newView);
      toast({
        title: "Success",
        description: "Default view updated successfully",
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setIsChangingPassword(false);
      setNewPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Label>Full Name</Label>
                    <Input value={userData?.full_name || ''} disabled />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Label>Email</Label>
                    <Input value={userData?.email || ''} disabled />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 space-y-2">
                    <Label>Password</Label>
                    {isChangingPassword ? (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <Button onClick={handlePasswordChange}>Save Password</Button>
                          <Button variant="ghost" onClick={() => setIsChangingPassword(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                        Change Password
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Label>Subscription Status</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="capitalize">{userData?.subscription_status || 'free'}</span>
                      {userData?.subscription_status === 'free' && (
                        <Button>Upgrade to Pro</Button>
                      )}
                    </div>
                    {userData?.subscription_end_date && (
                      <p className="text-sm text-gray-500 mt-1">
                        Expires: {new Date(userData.subscription_end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <div className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => updateTheme(checked ? "dark" : "light")}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Deal View</Label>
                <Select value={defaultView} onValueChange={updateDefaultView}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="board">Board View</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Add custom fields to your deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitCustomField)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="field_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Industry Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="field_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_required"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Required Field</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Add Custom Field</Button>
                </form>
              </Form>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>{field.field_name}</TableCell>
                        <TableCell className="capitalize">{field.field_type}</TableCell>
                        <TableCell>{field.is_required ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          {new Date(field.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Deals</CardTitle>
              <CardDescription>
                Upload your deals in bulk using CSV, JSON, or XLS formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Choose File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.json,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imports.map((import_) => (
                        <TableRow key={import_.id}>
                          <TableCell>{import_.filename}</TableCell>
                          <TableCell className="capitalize">{import_.status}</TableCell>
                          <TableCell>
                            {import_.total_records
                              ? `${Math.round(
                                  (import_.processed_records / import_.total_records) * 100
                                )}%`
                              : "0%"}
                          </TableCell>
                          <TableCell>{import_.success_count}</TableCell>
                          <TableCell>{import_.error_count}</TableCell>
                          <TableCell>
                            {new Date(import_.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
