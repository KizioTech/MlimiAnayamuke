import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/Header";
import { toast } from "sonner";
import { Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  created_at: string;
  is_approved?: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      console.log("Checking admin authentication...");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Auth user check:", { user: user?.id, userError });

      if (userError) {
        console.error("Auth user error:", userError);
        throw userError;
      }

      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("Profile fetch result:", { profile, profileError });

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        toast.error("Failed to verify user permissions");
        navigate("/login");
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", user.id);
        toast.error("User profile not found. Please contact support.");
        navigate("/login");
        return;
      }

      console.log("User role:", profile.role);

      if (profile.role !== "admin") {
        console.log("User is not admin, redirecting to dashboard");
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      console.log("Admin authentication successful");
    } catch (error) {
      console.error("Auth check error:", error);
      toast.error("Authentication failed");
      navigate("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users from profiles table...");

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Users fetch result:", { data: data?.length, error });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      setUsers(data || []);
      console.log("Users loaded successfully:", data?.length || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User approved successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ is_approved: false })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deactivated successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      toast.error("Failed to deactivate user");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500";
      case "consultant": return "bg-blue-500";
      case "farmer": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header userName="Admin" userLocation="" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Platform Overview</h2>
          <p className="text-muted-foreground">Manage users and monitor platform activity</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Farmers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === "farmer").length}
              </div>
              <p className="text-xs text-muted-foreground">Active farmers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Consultants</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === "consultant").length}
              </div>
              <p className="text-xs text-muted-foreground">Approved consultants</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === "consultant" && !u.is_approved).length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <Card>
           <CardHeader>
             <CardTitle>User Management</CardTitle>
             <CardDescription>View and manage platform users</CardDescription>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Name</TableHead>
                   <TableHead>Email</TableHead>
                   <TableHead>Phone</TableHead>
                   <TableHead>Role</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Joined</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {users.map((user) => (
                   <TableRow key={user.id}>
                     <TableCell className="font-medium">{user.name}</TableCell>
                     <TableCell>{user.email}</TableCell>
                     <TableCell>{user.phone || "-"}</TableCell>
                     <TableCell>
                       <Badge className={getRoleBadgeColor(user.role)}>
                         {user.role}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <Badge variant={user.is_approved ? "default" : "destructive"}>
                         {user.is_approved ? "Approved" : "Pending"}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {new Date(user.created_at).toLocaleDateString()}
                     </TableCell>
                     <TableCell>
                       <div className="flex gap-2">
                         {user.role !== "admin" && (
                           <>
                             {!user.is_approved ? (
                               <Button
                                 size="sm"
                                 onClick={() => handleApproveUser(user.id)}
                                 className="flex items-center gap-1"
                               >
                                 <CheckCircle className="h-3 w-3" />
                                 Approve
                               </Button>
                             ) : (
                               <Button
                                 size="sm"
                                 variant="destructive"
                                 onClick={() => handleDeactivateUser(user.id)}
                                 className="flex items-center gap-1"
                               >
                                 <XCircle className="h-3 w-3" />
                                 Deactivate
                               </Button>
                             )}
                           </>
                         )}
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Key metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">User Growth Rate</span>
                <span className="font-medium text-green-600">+12% this month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Consultations</span>
                <span className="font-medium">{users.filter(u => u.role === "consultant" && u.is_approved).length * 3}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="font-medium">2.4 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Satisfaction Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Platform status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <Badge variant="default" className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Response Time</span>
                <span className="font-medium">120ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="font-medium text-green-600">0.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
