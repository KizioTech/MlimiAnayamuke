import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ui/Header";
import { toast } from "sonner";
import {
  User,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen
} from "lucide-react";

import Footer from "@/components/ui/Footer";

interface Consultation {
  id: string;
  farmer_id: string;
  status: string;
  issue_description: string;
  recommendation: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
    phone: string | null;
    email: string;
  };
  farms?: {
    farm_name: string;
    location: string;
    crops: string[];
  };
}

interface ConsultantProfile {
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
}

const Consultant = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [profile, setProfile] = useState<ConsultantProfile | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    closed: 0
  });

  useEffect(() => {
    checkAuth();
    fetchConsultantProfile();
    fetchConsultations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('consultations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations'
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "consultant") {
      toast.error("Access denied. Consultant role required.");
      navigate("/dashboard");
    }
  };

  const fetchConsultantProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("name, email, phone")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("consultations")
        .select(`
          *,
          profiles!consultations_farmer_id_fkey (name, phone, email)
        `)
        .eq("consultant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const consultationsData = data || [];
      setConsultations(consultationsData);
      
      // Calculate statistics
      setStats({
        total: consultationsData.length,
        pending: consultationsData.filter((c: Consultation) => c.status === 'pending').length,
        active: consultationsData.filter((c: Consultation) => c.status === 'active').length,
        closed: consultationsData.filter((c: Consultation) => c.status === 'closed').length
      });
    } catch (error: any) {
      toast.error("Error loading consultations: " + error.message);
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
        c.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.issue_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleAddRecommendation = async (consultationId: string) => {
    if (!recommendation.trim()) {
      toast.error("Please enter a recommendation");
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("consultations")
        .update({
          recommendation,
          status: "closed",
          updated_at: new Date().toISOString()
        })
        .eq("id", consultationId);

      if (error) throw error;

      toast.success("Recommendation added successfully");
      setRecommendation("");
      setSelectedConsultation(null);
      fetchConsultations();
    } catch (error: any) {
      toast.error("Error submitting recommendation: " + error.message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleMarkAsActive = async (consultationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("consultations")
        .update({
          status: "active",
          updated_at: new Date().toISOString()
        })
        .eq("id", consultationId);

      if (error) throw error;
      toast.success("Consultation marked as active");
      fetchConsultations();
    } catch (error: any) {
      toast.error("Error updating status: " + error.message);
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

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header userName={profile?.name || ""} userLocation="" />

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Farmers under consultation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions & Guidelines Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Consultant Guidelines & Instructions
            </CardTitle>
            <CardDescription>
              Best practices for providing effective agricultural consultancy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Consultation Process</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h5 className="font-medium">Review Farmer's Issue</h5>
                      <p className="text-sm text-muted-foreground">Carefully read the farmer's description, farm details, and any attached information.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h5 className="font-medium">Mark as Active</h5>
                      <p className="text-sm text-muted-foreground">Change consultation status to "Active" when you begin working on it.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h5 className="font-medium">Provide Detailed Recommendations</h5>
                      <p className="text-sm text-muted-foreground">Give specific, actionable advice based on local conditions, soil type, and crop requirements.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Best Practices</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100">Consider Local Context</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Factor in local climate, soil conditions, available resources, and traditional farming practices.</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900 dark:text-green-100">Sustainable Solutions</h5>
                    <p className="text-sm text-green-700 dark:text-green-300">Prioritize environmentally friendly and economically viable recommendations.</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                    <h5 className="font-medium text-orange-900 dark:text-orange-100">Clear Communication</h5>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Use simple language, provide step-by-step instructions, and explain the reasoning behind recommendations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-lg mb-4">Common Consultation Topics</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium">Crop Management</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Planting schedules</li>
                    <li>• Fertilizer recommendations</li>
                    <li>• Irrigation techniques</li>
                    <li>• Pest control methods</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Soil Health</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Soil testing interpretation</li>
                    <li>• pH adjustment</li>
                    <li>• Organic matter improvement</li>
                    <li>• Erosion prevention</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Farm Planning</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Crop rotation strategies</li>
                    <li>• Market analysis</li>
                    <li>• Equipment selection</li>
                    <li>• Risk management</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
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
                placeholder="Search by farmer name, issue, or farm..."
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

        {/* Consultations Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({filteredConsultations.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filteredConsultations.filter(c => c.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({filteredConsultations.filter(c => c.status === 'active').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No consultations found</p>
                </CardContent>
              </Card>
            ) : (
              filteredConsultations.map((consultation) => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  selectedConsultation={selectedConsultation}
                  recommendation={recommendation}
                  loading={loading}
                  onSelectConsultation={setSelectedConsultation}
                  onRecommendationChange={setRecommendation}
                  onAddRecommendation={handleAddRecommendation}
                  onMarkAsActive={handleMarkAsActive}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <ConsultationCard
                key={consultation.id}
                consultation={consultation}
                selectedConsultation={selectedConsultation}
                recommendation={recommendation}
                loading={loading}
                onSelectConsultation={setSelectedConsultation}
                onRecommendationChange={setRecommendation}
                onAddRecommendation={handleAddRecommendation}
                onMarkAsActive={handleMarkAsActive}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <ConsultationCard
                key={consultation.id}
                consultation={consultation}
                selectedConsultation={selectedConsultation}
                recommendation={recommendation}
                loading={loading}
                onSelectConsultation={setSelectedConsultation}
                onRecommendationChange={setRecommendation}
                onAddRecommendation={handleAddRecommendation}
                onMarkAsActive={handleMarkAsActive}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
    <Footer />
    </>
  );
};

// Consultation Card Component
const ConsultationCard = ({
  consultation,
  selectedConsultation,
  recommendation,
  loading,
  onSelectConsultation,
  onRecommendationChange,
  onAddRecommendation,
  onMarkAsActive,
  getStatusColor,
  getStatusIcon
}: any) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{
      borderLeftColor: consultation.status === 'pending' ? '#eab308' : 
                       consultation.status === 'active' ? '#3b82f6' : '#22c55e'
    }}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {consultation.profiles?.name || "Unknown Farmer"}
            </CardTitle>
            
            {consultation.farms && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{consultation.farms.farm_name}</span>
                {consultation.farms.crops && consultation.farms.crops.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {consultation.farms.crops.join(", ")}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(consultation.created_at).toLocaleDateString()}
              </div>
              {consultation.profiles?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {consultation.profiles.phone}
                </div>
              )}
              {consultation.profiles?.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {consultation.profiles.email}
                </div>
              )}
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
              Your Recommendation:
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {consultation.recommendation}
            </p>
          </div>
        )}

        {consultation.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onMarkAsActive(consultation.id)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Mark as Active
            </Button>
          </div>
        )}

        {consultation.status !== "closed" && (
          <div className="space-y-3 pt-4 border-t">
            {selectedConsultation === consultation.id ? (
              <>
                <Textarea
                  placeholder="Enter your detailed recommendation for the farmer..."
                  value={recommendation}
                  onChange={(e) => onRecommendationChange(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => onAddRecommendation(consultation.id)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {loading ? "Submitting..." : "Submit & Close"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSelectConsultation(null);
                      onRecommendationChange("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={() => onSelectConsultation(consultation.id)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Add Recommendation
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Consultant;