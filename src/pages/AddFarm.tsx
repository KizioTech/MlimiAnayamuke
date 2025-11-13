import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import MapSelector from "@/components/MapSelector";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  Upload,
  MapPin,
  Sprout,
  Droplets,
  Sun
} from "lucide-react";
import { format } from "date-fns";

interface FarmTask {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'planting' | 'watering' | 'harvesting' | 'fertilizing' | 'pesticide' | 'other';
}

const AddFarm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [farmData, setFarmData] = useState({
    farm_name: "",
    size: "",
    location: "",
    soil_type: "",
    crops: [] as string[],
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
    geojson: null as any
  });

  const [currentCrop, setCurrentCrop] = useState("");
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: 'planting' as FarmTask['type']
  });

  const cropOptions = [
    "Maize", "Rice", "Cassava", "Sweet Potato", "Irish Potato", "Beans", "Groundnuts",
    "Soybeans", "Tomatoes", "Onions", "Cabbage", "Carrots", "Lettuce", "Spinach",
    "Bananas", "Pineapples", "Mangoes", "Papaya", "Coffee", "Tea", "Tobacco"
  ];

  const taskTypes = [
    { value: 'planting', label: 'Planting', icon: Sprout },
    { value: 'watering', label: 'Watering', icon: Droplets },
    { value: 'harvesting', label: 'Harvesting', icon: Sun },
    { value: 'fertilizing', label: 'Fertilizing', icon: Plus },
    { value: 'pesticide', label: 'Pesticide Application', icon: Plus },
    { value: 'other', label: 'Other', icon: Plus }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addCrop = () => {
    if (currentCrop && !farmData.crops.includes(currentCrop)) {
      setFarmData(prev => ({
        ...prev,
        crops: [...prev.crops, currentCrop]
      }));
      setCurrentCrop("");
    }
  };

  const removeCrop = (crop: string) => {
    setFarmData(prev => ({
      ...prev,
      crops: prev.crops.filter(c => c !== crop)
    }));
  };

  const addTask = () => {
    if (newTask.title && selectedDate) {
      const task: FarmTask = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        date: selectedDate,
        type: newTask.type
      };
      setTasks(prev => [...prev, task]);
      setNewTask({ title: "", description: "", type: 'planting' });
      setSelectedDate(undefined);
      setShowCalendar(false);
    }
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const uploadImages = async (): Promise<string[]> => {
    // Skip image upload for now since storage bucket may not be set up
    console.log('Image upload skipped - storage bucket not configured');
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to add a farm");
        navigate("/login");
        return;
      }

      // Upload images first
      const uploadedImageUrls = await uploadImages();

      // Create farm record - only include fields that exist in the database
      const farmRecord = {
        farmer_id: user.id,
        farm_name: farmData.farm_name,
        size: parseFloat(farmData.size) || null,
        crops: farmData.crops.length > 0 ? farmData.crops : null,
        soil_type: farmData.soil_type || null,
        location: farmData.location || null,
        geojson: farmData.geojson
      };

      const { data, error } = await (supabase as any)
        .from('farms')
        .insert([farmRecord])
        .select()
        .single();

      if (error) throw error;

      toast.success("Farm added successfully!");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Error adding farm:", error);
      toast.error(error.message || "Failed to add farm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header userName="" userLocation="" />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Add New Farm</h1>
              <p className="text-muted-foreground">
                Create a comprehensive profile for your farm with details, crops, and scheduled tasks
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Farm Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the fundamental details about your farm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farm_name">Farm Name *</Label>
                      <Input
                        id="farm_name"
                        placeholder="e.g., Main Field, Riverside Farm"
                        value={farmData.farm_name}
                        onChange={(e) => setFarmData(prev => ({ ...prev, farm_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Farm Size (hectares)</Label>
                      <Input
                        id="size"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={farmData.size}
                        onChange={(e) => setFarmData(prev => ({ ...prev, size: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., Zomba District, Malawi"
                        value={farmData.location}
                        onChange={(e) => setFarmData(prev => ({ ...prev, location: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/*<div className="space-y-2">
                    <Label>Farm Boundary on Map</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <MapSelector
                        mode="polygon"
                        onPolygonSelect={(coordinates) => {
                          // Convert coordinates to GeoJSON format
                          const geojson = {
                            type: "Polygon",
                            coordinates: [coordinates.map(coord => [coord[1], coord[0]])] // Convert from [lat,lng] to [lng,lat]
                          };
                          setFarmData(prev => ({
                            ...prev,
                            geojson: geojson
                          }));
                        }}
                        height="300px"
                      />
                    </div>
                    {farmData.geojson && (
                      <p className="text-sm text-muted-foreground">
                        Boundary defined with {farmData.geojson.coordinates[0].length - 1} points
                      </p>
                    )}
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="soil_type">Soil Type</Label>
                    <Select
                      value={farmData.soil_type}
                      onValueChange={(value) => setFarmData(prev => ({ ...prev, soil_type: value }))}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your farm, its history, or any special features..."
                      value={farmData.description}
                      onChange={(e) => setFarmData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Crops Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Crops</CardTitle>
                  <CardDescription>
                    Add the crops you grow or plan to grow on this farm
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    {farmData.crops.map(crop => (
                      <Badge key={crop} variant="secondary" className="flex items-center gap-1">
                        {crop}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeCrop(crop)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Farm Images
                  </CardTitle>
                  <CardDescription>
                    Upload up to 5 images of your farm (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground rounded-md cursor-pointer hover:bg-muted/50"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Images
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {images.length}/5 images selected
                    </span>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Farm ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks/Calendar Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Farm Tasks & Schedule
                  </CardTitle>
                  <CardDescription>
                    Schedule important farming activities and tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input
                          placeholder="e.g., Plant maize seeds"
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Task Type</Label>
                        <Select
                          value={newTask.type}
                          onValueChange={(value: FarmTask['type']) => setNewTask(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {taskTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Task Date</Label>
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="Additional details about the task..."
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <Button type="button" onClick={addTask} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Scheduled Tasks</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {tasks.map(task => (
                          <div key={task.id} className="flex items-start justify-between p-3 border rounded-md">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.type}
                                </Badge>
                                <span className="font-medium">{task.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(task.date, "PPP")}
                              </p>
                              {task.description && (
                                <p className="text-sm mt-1">{task.description}</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {tasks.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tasks scheduled yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding Farm..." : "Add Farm"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default AddFarm;