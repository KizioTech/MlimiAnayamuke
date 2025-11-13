import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { toast } from "sonner";
import {
  Edit,
  Save,
  X,
  MapPin,
  Sprout,
  Droplets,
  Sun,
  Calendar,
  Plus,
  Eye,
  Trash2
} from "lucide-react";

interface Farm {
  id: string;
  farm_name: string;
  size: number;
  crops: string[];
  soil_type: string;
  location: string;
  description?: string;
  created_at: string;
}

const FarmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Farm>>({});
  const [currentCrop, setCurrentCrop] = useState("");

  const cropOptions = [
    "Maize", "Rice", "Cassava", "Sweet Potato", "Irish Potato", "Beans", "Groundnuts",
    "Soybeans", "Tomatoes", "Onions", "Cabbage", "Carrots", "Lettuce", "Spinach",
    "Bananas", "Pineapples", "Mangoes", "Papaya", "Coffee", "Tea", "Tobacco"
  ];

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchFarm();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
  };

  const fetchFarm = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("farms")
        .select("*")
        .eq("id", id)
        .eq("farmer_id", user.id)
        .single();

      if (error) throw error;
      setFarm(data);
      setEditData(data);
    } catch (error: any) {
      console.error("Error fetching farm:", error);
      toast.error("Failed to load farm details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!farm) return;

    try {
      const { error } = await (supabase as any)
        .from("farms")
        .update(editData)
        .eq("id", farm.id);

      if (error) throw error;

      setFarm({ ...farm, ...editData });
      setEditing(false);
      toast.success("Farm updated successfully");
    } catch (error: any) {
      toast.error("Failed to update farm");
    }
  };

  const handleCancel = () => {
    setEditData(farm || {});
    setEditing(false);
  };

  const addCrop = () => {
    if (currentCrop && editData.crops && !editData.crops.includes(currentCrop)) {
      setEditData(prev => ({
        ...prev,
        crops: [...(prev.crops || []), currentCrop]
      }));
      setCurrentCrop("");
    }
  };

  const removeCrop = (crop: string) => {
    setEditData(prev => ({
      ...prev,
      crops: prev.crops?.filter(c => c !== crop) || []
    }));
  };

  const handleRequestConsultation = () => {
    navigate("/consultations", { state: { farmId: farm?.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName="" userLocation="" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading farm details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName="" userLocation="" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Farm Not Found</h2>
            <p className="text-muted-foreground mb-4">The farm you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Header userName="" userLocation="" />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {editing ? "Edit Farm" : farm.farm_name}
              </h1>
              <p className="text-muted-foreground">
                {editing ? "Update your farm information" : "Manage and monitor your farm"}
              </p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setEditing(true)} variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Farm
                  </Button>
                  <Button onClick={handleRequestConsultation} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Request Consultation
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Farm Information */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    Farm Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farm_name">Farm Name</Label>
                      {editing ? (
                        <Input
                          id="farm_name"
                          value={editData.farm_name || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, farm_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-lg font-medium">{farm.farm_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Farm Size (hectares)</Label>
                      {editing ? (
                        <Input
                          id="size"
                          type="number"
                          step="0.1"
                          value={editData.size || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
                        />
                      ) : (
                        <p className="text-lg font-medium">{farm.size} hectares</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    {editing ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="e.g., Zomba District, Malawi"
                          value={editData.location || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{farm.location || "Location not specified"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soil_type">Soil Type</Label>
                    {editing ? (
                      <Select
                        value={editData.soil_type || ""}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, soil_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clay">Clay Soil</SelectItem>
                          <SelectItem value="sandy">Sandy Soil</SelectItem>
                          <SelectItem value="loamy">Loamy Soil</SelectItem>
                          <SelectItem value="silt">Silt Soil</SelectItem>
                          <SelectItem value="peaty">Peaty Soil</SelectItem>
                          <SelectItem value="chalky">Chalky Soil</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-lg">{farm.soil_type || "Not specified"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    {editing ? (
                      <Textarea
                        id="description"
                        placeholder="Describe your farm..."
                        value={editData.description || ""}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    ) : (
                      <p className="text-muted-foreground">{farm.description || "No description provided"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Crops */}
              <Card>
                <CardHeader>
                  <CardTitle>Crops</CardTitle>
                  <CardDescription>
                    Crops grown on this farm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Select value={currentCrop} onValueChange={setCurrentCrop}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a crop" />
                          </SelectTrigger>
                          <SelectContent>
                            {cropOptions.map(crop => (
                              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" onClick={addCrop} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editData.crops || []).map(crop => (
                          <Badge key={crop} variant="secondary" className="flex items-center gap-1">
                            {crop}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeCrop(crop)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {farm.crops && farm.crops.length > 0 ? (
                        farm.crops.map(crop => (
                          <Badge key={crop} variant="secondary">
                            {crop}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No crops specified</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleRequestConsultation} className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Consultation
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Farms
                  </Button>
                </CardContent>
              </Card>

              {/* Farm Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Farm Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-medium">{farm.size} ha</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Crops</span>
                    <span className="font-medium">{farm.crops?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium text-sm">
                      {new Date(farm.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Weather integration coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FarmDetail;