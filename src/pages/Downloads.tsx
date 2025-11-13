import React, { useState } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  Search,
  Filter,
  ChevronDown,
  FileText,
  Video,
  BookOpen,
  Download,
} from "lucide-react";

const Downloads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const categories = [
    "All",
    "Fundamentals",
    "Sustainability",
    "Crop Protection",
    "Planning",
    "Marketing",
  ];
  const resourceTypes = ["All", "PDF", "Video", "Article"];

  const resources = [
    {
      id: "soil-health",
      title: "Soil Health Management",
      description:
        "Comprehensive guide on testing and improving soil quality for better yields",
      category: "Fundamentals",
      type: "PDF",
      size: "2.5 MB",
      downloads: 1234,
      uploadDate: "2024-10-15",
      fileUrl: "/downloads/soil-health.pdf",
    },
    {
      id: "water-conservation",
      title: "Water Conservation Techniques",
      description:
        "Efficient irrigation methods that save water and reduce operational costs",
      category: "Sustainability",
      type: "PDF",
      size: "3.1 MB",
      downloads: 987,
      uploadDate: "2024-10-20",
      fileUrl: "/downloads/water-conservation.pdf",
    },
    {
      id: "pest-control",
      title: "Pest Control Best Practices",
      description: "Natural and effective ways to protect your crops from common pests",
      category: "Crop Protection",
      type: "Article",
      size: "1.8 MB",
      downloads: 1456,
      uploadDate: "2024-10-25",
      fileUrl: "/downloads/pest-control.pdf",
    },
    {
      id: "crop-rotation",
      title: "Crop Rotation Strategies",
      description: "Maximize your land productivity with proven rotation techniques",
      category: "Planning",
      type: "PDF",
      size: "2.2 MB",
      downloads: 876,
      uploadDate: "2024-10-28",
      fileUrl: "/downloads/crop-rotation.pdf",
    },
    {
      id: "organic-farming",
      title: "Introduction to Organic Farming",
      description: "Step-by-step guide to transitioning to organic farming practices",
      category: "Sustainability",
      type: "Video",
      size: "45 MB",
      downloads: 2103,
      uploadDate: "2024-11-01",
      fileUrl: "/downloads/organic-farming.mp4",
    },
    {
      id: "market-access",
      title: "Market Access and Pricing Strategies",
      description: "Learn how to find buyers and negotiate better prices for your produce",
      category: "Marketing",
      type: "PDF",
      size: "1.9 MB",
      downloads: 654,
      uploadDate: "2024-11-03",
      fileUrl: "/downloads/market-access.pdf",
    },
    {
      id: "composting",
      title: "Composting for Better Soil",
      description: "Create nutrient-rich compost using farm waste and organic materials",
      category: "Fundamentals",
      type: "Article",
      size: "1.5 MB",
      downloads: 789,
      uploadDate: "2024-11-05",
      fileUrl: "/downloads/composting.pdf",
    },
    {
      id: "greenhouse",
      title: "Greenhouse Management Basics",
      description: "Essential techniques for successful greenhouse crop production",
      category: "Planning",
      type: "PDF",
      size: "3.8 MB",
      downloads: 543,
      uploadDate: "2024-11-06",
      fileUrl: "/downloads/greenhouse.pdf",
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      resource.title.toLowerCase().includes(q) ||
      resource.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType = selectedType === "All" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDownload = (resource: typeof resources[0]) => {
    // In a real app, this would trigger an actual download
    console.log("Downloading:", resource.title);
    alert(`Downloading: ${resource.title}\nThis would download the file in a real application.`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="w-5 h-5" />;
      case "Video":
        return <Video className="w-5 h-5" />;
      case "Article":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName="" userLocation="" />
      {/* Header */}
      <div className="bg-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Resource Library</h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Access free educational materials to improve your farming practices and increase productivity
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} Category
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                >
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type} Format
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm font-medium">{resource.type}</span>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">{resource.size}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                    {resource.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-green-700 transition-colors">
                  {resource.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>{resource.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div>{new Date(resource.uploadDate).toLocaleDateString()}</div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(resource)}
                  className="w-full bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Downloads;