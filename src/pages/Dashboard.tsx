import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ui/Header";
import {
  Plus,
  Sprout,
  Cloud,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Droplets,
  Wind,
  Eye,
  MapPin,
  Activity,
  Lightbulb,
  Bell,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface Farm {
  id: string;
  farm_name: string;
  size: number;
  crops: string[];
  soil_type: string;
  location: any;
  created_at: string;
}

interface Consultation {
  id: string;
  status: string;
  issue_description: string;
  recommendation: string | null;
  created_at: string;
  updated_at: string;
}

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

import Footer from "@/components/ui/Footer";



const Dashboard: React.FC = () => {

  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);

  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userLocation, setUserLocation] = useState("Zomba, Malawi");



  useEffect(() => {

    checkUser();

    fetchFarms();

    fetchConsultations();

    fetchWeather();

    generateRecentActivities();



    // Real-time updates for consultations

    const channel = supabase

      .channel('farmer-consultations')

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

  }, []);



  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("name, language")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(typeof profile.name === 'string' ? profile.name : '');
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/login");
    }
  };



  const fetchFarms = async () => {
    try {
      setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await (supabase as any)
        .from("farms")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error("Error fetching farms:", error);
      setError("Failed to load farms");
      toast.error("Failed to load farms");
    } finally {
      setLoading(false);
    }
  };



  const fetchConsultations = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("consultations")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Failed to load consultations");
    }
  };



  const fetchWeather = async () => {
    try {
      // Get a free API key from: https://www.weatherapi.com/signup.aspx
      // For Vite, use import.meta.env instead of process.env
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

      if (!apiKey) {
        console.warn("Weather API key not configured. Using mock data.");
        setWeather({
          temp: 25,
          humidity: 65,
          windSpeed: 12,
          description: "Partly cloudy",
          icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
        });
        return;
      }

      const location = userLocation || "Zomba, Malawi";
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;

      console.log("Fetching weather for:", location);

      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Weather API error:", res.status, errorData);

        // Fallback to mock data on API errors
        console.warn("Weather API failed, using mock data");
        setWeather({
          temp: 25,
          humidity: 65,
          windSpeed: 12,
          description: "Weather data unavailable",
          icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Weather API key is invalid. Using mock data.");
        } else if (res.status === 400) {
          toast.error("Invalid location for weather data. Using mock data.");
        } else {
          toast.error(`Weather service unavailable (${res.status}). Using mock data.`);
        }
        return;
      }

      const data = await res.json();
      console.log("Weather data received:", data);

      setWeather({
        temp: data.current?.temp_c ?? 25,
        humidity: data.current?.humidity ?? 65,
        windSpeed: data.current?.wind_kph ?? 12,
        description: data.current?.condition?.text ?? "Weather data unavailable",
        icon: data.current?.condition?.icon ?? "//cdn.weatherapi.com/weather/64x64/day/116.png"
      });

    } catch (error) {
      console.error("Error fetching weather:", error);
      // Fallback to mock data on network errors
      console.warn("Network error, using mock weather data");
      setWeather({
        temp: 25,
        humidity: 65,
        windSpeed: 12,
        description: "Weather data unavailable",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
      });
      toast.error("Failed to load weather data. Using mock data.");
    }
  };



  const generateRecentActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent consultations
      const { data: consultations } = await (supabase as any)
        .from("consultations")
        .select("*")
        .eq("farmer_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch recent farm activities (if we had an activities table)
      const activities: Activity[] = [];

      // Add consultation activities
      if (consultations) {
        consultations.forEach((consultation: any) => {
          activities.push({
            id: `consultation-${consultation.id}`,
            type: consultation.status === 'closed' ? 'consultation_response' : 'consultation_pending',
            message: consultation.status === 'closed'
              ? "Consultation response received"
              : "Consultation request submitted",
            timestamp: consultation.updated_at || consultation.created_at
          });
        });
      }

      // Add farm creation activities
      if (farms.length > 0) {
        farms.slice(0, 3).forEach((farm) => {
          activities.push({
            id: `farm-${farm.id}`,
            type: "farm_added",
            message: `New farm added: ${farm.farm_name}`,
            timestamp: farm.created_at
          });
        });
      }

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 5));

    } catch (error) {
      console.error("Error fetching activities:", error);
      // Fallback to mock data
      const mockActivities: Activity[] = [
        {
          id: "1",
          type: "farm_added",
          message: "New farm added: Main Field",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      setActivities(mockActivities);
    }
  };



  const getConsultationStats = () => {

    return {

      total: consultations.length,

      pending: consultations.filter(c => c.status === 'pending').length,

      active: consultations.filter(c => c.status === 'active').length,

      closed: consultations.filter(c => c.status === 'closed').length

    };

  };



  const getTotalCropTypes = () => {

    const allCrops = farms.flatMap(farm => Array.isArray(farm.crops) ? farm.crops : []);

    return new Set(allCrops).size;

  };



  const getStatusIcon = (status: string) => {

    switch (status) {

      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;

      case 'active': return <Activity className="h-4 w-4 text-blue-500" />;

      case 'closed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;

      default: return <MessageSquare className="h-4 w-4" />;

    }

  };



  const getStatusColor = (status: string) => {

    switch (status) {

      case 'pending': return 'bg-yellow-500';

      case 'active': return 'bg-blue-500';

      case 'closed': return 'bg-green-500';

      default: return 'bg-gray-500';

    }

  };



  const consultationStats = getConsultationStats();



  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName={userName} userLocation={userLocation} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => { toast("Retrying..."); window.location.reload(); }}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header userName={userName} userLocation={userLocation} />



      <div className="container mx-auto px-4 py-8">

        {/* Welcome Section */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-foreground mb-2">

            Welcome back, {userName}! 👋

          </h2>

          <p className="text-muted-foreground">

            Here's what's happening with your farms today

          </p>

        </div>



        {/* Main Stats Grid */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <Card className="shadow-sm hover:shadow-md transition-shadow">

            <CardHeader className="pb-3">

              <div className="flex items-center justify-between">

                <CardDescription>Total Farms</CardDescription>

                <Sprout className="h-4 w-4 text-primary" />

              </div>

              <CardTitle className="text-3xl">{farms.length}</CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-xs text-muted-foreground">

                {getTotalCropTypes()} crop types

              </p>

            </CardContent>

          </Card>



          <Card className="shadow-sm hover:shadow-md transition-shadow">

            <CardHeader className="pb-3">

              <div className="flex items-center justify-between">

                <CardDescription>Total Area</CardDescription>

                <TrendingUp className="h-4 w-4 text-green-500" />

              </div>

              <CardTitle className="text-3xl">

                {farms.reduce((acc, farm) => acc + (typeof farm.size === 'number' ? farm.size : 0), 0).toFixed(1)}

              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-xs text-muted-foreground">hectares</p>

            </CardContent>

          </Card>



          <Card className="shadow-sm hover:shadow-md transition-shadow">

            <CardHeader className="pb-3">

              <div className="flex items-center justify-between">

                <CardDescription>Consultations</CardDescription>

                <MessageSquare className="h-4 w-4 text-blue-500" />

              </div>

              <CardTitle className="text-3xl">{consultationStats.total}</CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-xs text-muted-foreground">

                {consultationStats.pending} pending • {consultationStats.active} active

              </p>

            </CardContent>

          </Card>



          {weather && (

            <Card className="shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">

              <CardHeader className="pb-3">

                <div className="flex items-center justify-between">

                  <CardDescription>Weather</CardDescription>

                  <Cloud className="h-4 w-4 text-blue-500" />

                </div>

                <CardTitle className="text-3xl flex items-center gap-2">

                  {typeof weather.temp === 'number' ? weather.temp : 0}°C

                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="space-y-1 text-xs text-muted-foreground">

                  <div className="flex items-center gap-2">

                    <Droplets className="h-3 w-3" />

                    <span>Humidity: {typeof weather.humidity === 'number' ? weather.humidity : 0}%</span>

                  </div>

                  <div className="flex items-center gap-2">

                    <Wind className="h-3 w-3" />

                    <span>Wind: {typeof weather.windSpeed === 'number' ? weather.windSpeed : 0} km/h</span>

                  </div>

                </div>

              </CardContent>

            </Card>

          )}

        </div>



        {/* Main Content Tabs */}

        <Tabs defaultValue="farms" className="space-y-6">

          <TabsList className="grid w-full grid-cols-5">

            <TabsTrigger value="farms">Farms</TabsTrigger>

            <TabsTrigger value="consultations">

              Consultations

              {consultationStats.pending > 0 && (

                <Badge className="ml-2 bg-yellow-500">{consultationStats.pending}</Badge>

              )}

            </TabsTrigger>

            <TabsTrigger value="recommendations">AI Insights</TabsTrigger>

            <TabsTrigger value="activity">Activity</TabsTrigger>

            <TabsTrigger value="training">Training</TabsTrigger>

          </TabsList>



          {/* Farms Tab */}

          <TabsContent value="farms" className="space-y-6">

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-foreground">My Farms</h3>

              <Button onClick={() => navigate("/farm/new")}>

                <Plus className="w-4 h-4 mr-2" />

                Add New Farm

              </Button>

            </div>



            {loading ? (

              <div className="text-center py-12">

                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />

                <p className="text-muted-foreground">Loading farms...</p>

              </div>

            ) : farms.length === 0 ? (

              <Card className="shadow-sm">

                <CardContent className="py-12 text-center">

                  <Sprout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

                  <h4 className="text-xl font-semibold mb-2 text-foreground">No farms yet</h4>

                  <p className="text-muted-foreground mb-6">

                    Get started by adding your first farm and unlock personalized insights

                  </p>

                  <Button onClick={() => navigate("/farm/new")} size="lg">

                    <Plus className="w-4 h-4 mr-2" />

                    Add Your First Farm

                  </Button>

                </CardContent>

              </Card>

            ) : (

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {farms.map((farm) => (

                  <Card 

                    key={farm.id}

                    className="shadow-sm hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"

                    onClick={() => navigate(`/farmer/farm/${farm.id}`)}

                  >

                    <CardHeader>

                      <CardTitle className="flex items-center gap-2">

                        <Sprout className="w-5 h-5 text-primary" />

                        {typeof farm.farm_name === 'string' ? farm.farm_name : 'Unknown Farm'}

                      </CardTitle>

                      <CardDescription>

                        {farm.size ? `${farm.size} hectares` : "Size not specified"}

                      </CardDescription>

                    </CardHeader>

                    <CardContent className="space-y-3">

                      <div className="space-y-2 text-sm">

                        <div className="flex items-start gap-2">

                          <span className="font-semibold text-muted-foreground min-w-[60px]">Soil:</span>

                          <span className="text-foreground">{typeof farm.soil_type === 'string' ? farm.soil_type : "Not specified"}</span>

                        </div>

                        {Array.isArray(farm.crops) && farm.crops.length > 0 && (

                          <div className="flex items-start gap-2">

                            <span className="font-semibold text-muted-foreground min-w-[60px]">Crops:</span>

                            <div className="flex flex-wrap gap-1">

                              {farm.crops.map((crop, idx) => (

                                <Badge key={idx} variant="secondary" className="text-xs">

                                  {typeof crop === 'string' ? crop : 'Unknown'}

                                </Badge>

                              ))}

                            </div>

                          </div>

                        )}

                      </div>

                      <Button variant="ghost" size="sm" className="w-full mt-2">

                        <Eye className="h-4 w-4 mr-2" />

                        View Details

                      </Button>

                    </CardContent>

                  </Card>

                ))}

              </div>

            )}

          </TabsContent>



          {/* Consultations Tab */}

          <TabsContent value="consultations" className="space-y-6">

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-bold text-foreground">Recent Consultations</h3>

              <Button onClick={() => navigate("/consultations")}>

                <Plus className="w-4 h-4 mr-2" />

                New Consultation

              </Button>

            </div>



            {consultations.length === 0 ? (

              <Card>

                <CardContent className="py-12 text-center">

                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

                  <h4 className="text-xl font-semibold mb-2">No consultations yet</h4>

                  <p className="text-muted-foreground mb-6">

                    Request expert advice for your farming challenges

                  </p>

                  <Button onClick={() => navigate("/consultations")}>

                    <Plus className="w-4 h-4 mr-2" />

                    Request Consultation

                  </Button>

                </CardContent>

              </Card>

            ) : (

              <div className="space-y-4">

                {consultations.map((consultation) => (

                  <Card 

                    key={consultation.id}

                    className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"

                    onClick={() => navigate("/consultations")}

                  >

                    <CardHeader>

                      <div className="flex items-start justify-between">

                        <div className="space-y-1 flex-1">

                          <CardTitle className="text-base">

                            {typeof consultation.issue_description === 'string' ? consultation.issue_description.substring(0, 60) : 'Unknown'}

                            {typeof consultation.issue_description === 'string' && consultation.issue_description.length > 60 && "..."}

                          </CardTitle>

                          <CardDescription className="flex items-center gap-2">

                            <Calendar className="h-3 w-3" />

                            {new Date(consultation.created_at).toLocaleDateString()}

                          </CardDescription>

                        </div>

                        <Badge className={`${getStatusColor(consultation.status)} flex items-center gap-1`}>

                          {getStatusIcon(consultation.status)}

                          {typeof consultation.status === 'string' ? consultation.status : 'Unknown'}

                        </Badge>

                      </div>

                    </CardHeader>

                    {consultation.recommendation && (

                      <CardContent>

                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">

                          <p className="text-sm text-muted-foreground">

                            <span className="font-semibold text-green-700 dark:text-green-400">

                              Recommendation:

                            </span>{" "}

                            {typeof consultation.recommendation === 'string' ? consultation.recommendation.substring(0, 100) : ''}

                            {typeof consultation.recommendation === 'string' && consultation.recommendation.length > 100 && "..."}

                          </p>

                        </div>

                      </CardContent>

                    )}

                  </Card>

                ))}

                <Button 

                  variant="outline" 

                  className="w-full"

                  onClick={() => navigate("/consultations")}

                >

                  View All Consultations

                </Button>

              </div>

            )}

          </TabsContent>



          {/* AI Recommendations Tab */}

          <TabsContent value="recommendations" className="space-y-6">

            <h3 className="text-2xl font-bold text-foreground">AI-Powered Insights</h3>

            

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <Lightbulb className="h-5 w-5 text-yellow-500" />

                  Crop Yield Optimization

                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-4">

                <p className="text-sm text-muted-foreground">

                  Based on your soil type and current weather patterns, your maize yield could increase by 20% with optimized fertilizer application.

                </p>

                <Progress value={65} className="h-2" />

                <p className="text-xs text-muted-foreground">

                  Implementation progress: 65%

                </p>

                <Button variant="outline" size="sm" onClick={() => toast("Learn more about crop yield optimization coming soon!")}>

                  Learn More

                </Button>

              </CardContent>

            </Card>



            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <Droplets className="h-5 w-5 text-blue-500" />

                  Water Management

                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-4">

                <p className="text-sm text-muted-foreground">

                  Rainfall forecast suggests irrigation needed in 3 days. Recommend 15mm water application for optimal crop growth.

                </p>

                <Button variant="outline" size="sm" onClick={() => toast("Water management schedule coming soon!")}>

                  View Schedule

                </Button>

              </CardContent>

            </Card>



            <Card>

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <TrendingUp className="h-5 w-5 text-green-500" />

                  Market Insights

                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-4">

                <p className="text-sm text-muted-foreground">

                  Maize prices expected to rise by 15% next month. Consider timing your harvest for maximum profit.

                </p>

                <Button variant="outline" size="sm" onClick={() => toast("Market trends analysis coming soon!")}>

                  View Trends

                </Button>

              </CardContent>

            </Card>

          </TabsContent>



          {/* Activity Tab */}

          <TabsContent value="activity" className="space-y-6">

            <h3 className="text-2xl font-bold text-foreground">Recent Activity</h3>

            

            <div className="space-y-3">

              {activities.map((activity) => (

                <Card key={activity.id} className="shadow-sm">

                  <CardContent className="py-4">

                    <div className="flex items-start gap-3">

                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">

                        <Activity className="h-4 w-4 text-primary" />

                      </div>

                      <div className="flex-1">

                        <p className="text-sm font-medium">{typeof activity.message === 'string' ? activity.message : 'Unknown'}</p>

                        <p className="text-xs text-muted-foreground mt-1">

                          {new Date(activity.timestamp).toLocaleString()}

                        </p>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>

          </TabsContent>



          {/* Training Tab */}

          <TabsContent value="training" className="space-y-6">

            <h3 className="text-2xl font-bold text-foreground">Training & Resources</h3>

            

            <Card className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <BookOpen className="h-5 w-5 text-green-600" />

                  Mlimi-Connect Training

                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-4">

                <p className="text-sm text-muted-foreground">

                  Access our comprehensive library of training materials, tutorials, and best practice guides to help you succeed.

                </p>

                <Button variant="outline" size="sm" onClick={() => { toast("Navigating to training..."); navigate("/training"); }}>

                  Go to Training

                </Button>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

    </div>

    <Footer />

    </>

  );

};

export default Dashboard;




