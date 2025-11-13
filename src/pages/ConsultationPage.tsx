import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { toast } from "sonner";
import {
  Plus,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Filter,
  Search,
  User,
  MapPin
} from "lucide-react";

interface Consultation {
  id: string;
  farmer_id: string;
  consultant_id?: string;
  status: string;
  issue_description: string;
  recommendation?: string;
  created_at: string;
  updated_at: string;
  farms?: {
    farm_name: string;
    location: string;
    crops: string[];
  };
  profiles?: {
    name: string;
    phone?: string;
    email: string;
  };
}

interface UserProfile {
  name: string;
  role: string;
}

const ConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState("");
  const [farms, setFarms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get farmId from navigation state if coming from farm detail
  const farmId = location.state?.farmId;

  useEffect(() => {
    checkAuth();
    fetchUserProfile();
    fetchFarms();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchConsultations();

      // Real-time updates
      const channel = supabase
        .channel('consultations-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'consultations'
        }, () => {
          fetchConsultations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile]);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]);

  useEffect(() => {
    if (farmId) {
      setSelectedFarm(farmId);
      setShowNewForm(true);
    }
  }, [farmId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist, set a default role
        setUserProfile({ name: "User", role: "farmer" });
        return;
      }
      setUserProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Set default profile on error
      setUserProfile({ name: "User", role: "farmer" });
    }
  };

  const fetchFarms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("farms")
        .select("id, farm_name")
        .eq("farmer_id", user.id);

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      console.error("Error fetching farms:", error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = (supabase as any)
        .from("consultations")
        .select(`
          *,
          profiles!consultations_farmer_id_fkey (name, phone, email)
        `);

      // Filter based on user role
      if (userProfile?.role === "farmer") {
        query = query.eq("farmer_id", user.id);
      } else if (userProfile?.role === "consultant") {
        query = query.eq("consultant_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error: any) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = consultations;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.issue_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleCreateConsultation = async () => {
    if (!selectedFarm || !issueDescription.trim()) {
      toast.error("Please select a farm and describe your issue");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from("consultations")
        .insert({
          farmer_id: user.id,
          farm_id: selectedFarm,
          issue_description: issueDescription,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Consultation request submitted successfully");
      setShowNewForm(false);
      setSelectedFarm("");
      setIssueDescription("");
      fetchConsultations();
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      toast.error("Failed to submit consultation request");
    }
  };

  const handleQuickReply = async (consultationId: string, reply: string) => {
    try {
      const { error } = await (supabase as any)
        .from("consultations")
        .update({
          recommendation: reply,
          status: "closed",
          updated_at: new Date().toISOString()
        })
        .eq("id", consultationId);

      if (error) throw error;

      toast.success("Quick reply sent successfully");
      fetchConsultations();
    } catch (error: any) {
      console.error("Error sending quick reply:", error);
      toast.error("Failed to send reply");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "active": return "bg-blue-500";
      case "closed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "active": return <AlertCircle className="h-4 w-4" />;
      case "closed": return <CheckCircle2 className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStats = () => {
    return {
      total: consultations.length,
      pending: consultations.filter(c => c.status === 'pending').length,
      active: consultations.filter(c => c.status === 'active').length,
      closed: consultations.filter(c => c.status === 'closed').length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName={userProfile?.name || ""} userLocation="" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName={userProfile?.name || ""} userLocation="" />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Consultations</h1>
              <p className="text-muted-foreground">
                {userProfile?.role === "farmer"
                  ? "Request expert advice and track your consultation requests"
                  : "Manage consultation requests from farmers"
                }
              </p>
            </div>
            {userProfile?.role === "farmer" && (
              <Button onClick={() => setShowNewForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Consultation
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
              </CardContent>
            </Card>
          </div>

          {/* New Consultation Form */}
          {showNewForm && userProfile?.role === "farmer" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Request New Consultation
                </CardTitle>
                <CardDescription>
                  Describe your farming issue and we'll connect you with an expert consultant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farm">Select Farm</Label>
                  <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose the farm related to this consultation" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map(farm => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.farm_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">Describe Your Issue</Label>
                  <Textarea
                    id="issue"
                    placeholder="Please provide detailed information about your farming issue, including what you've observed, when it started, and any steps you've already taken..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateConsultation} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNewForm(false);
                      setSelectedFarm("");
                      setIssueDescription("");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by issue, farm, or consultant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Consultations List */}
          <div className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No consultations found</h3>
                  <p className="text-muted-foreground text-center">
                    {userProfile?.role === "farmer"
                      ? "You haven't requested any consultations yet. Click 'New Consultation' to get started."
                      : "No consultation requests assigned to you yet."
                    }
                  </p>
                  {userProfile?.role === "farmer" && (
                    <Button onClick={() => setShowNewForm(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Request Consultation
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredConsultations.map((consultation) => (
                <Card key={consultation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          {userProfile?.role === "farmer"
                            ? (consultation.profiles?.name || "Consultant")
                            : "Farmer Consultation"
                          }
                        </CardTitle>

                        {/* Farm info would be shown here if we had the relationship */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Farm consultation</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(consultation.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <Badge className={`${getStatusColor(consultation.status)} flex items-center gap-1`}>
                        {getStatusIcon(consultation.status)}
                        {consultation.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Issue Description:
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {consultation.issue_description}
                      </p>
                    </div>

                    {consultation.recommendation && (
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Consultant Recommendation:
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {consultation.recommendation}
                        </p>
                      </div>
                    )}

                    {userProfile?.role === "consultant" && consultation.status !== "closed" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => navigate(`/consultant`)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Manage in Dashboard
                        </Button>
                        <Button
                          onClick={() => {
                            // Quick reply functionality
                            const reply = prompt("Enter your quick recommendation:");
                            if (reply && reply.trim()) {
                              handleQuickReply(consultation.id, reply.trim());
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Quick Reply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConsultationPage;