import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sprout, Users, LineChart, CheckCircle, Sun, Droplets, BookOpen, TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin} from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";
import Footer from "@/components/ui/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src="/src/assets/logo.jpeg" 
            alt="MAI Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-bold text-gray-900">Mlimi Anyamuke Initiative | MAI</span>
      </div>
      <div className="flex gap-4">
        <button className="px-4 py-2 text-gray-700 hover:text-green-700 font-medium transition-colors">
          <Link to="/login">Login</Link>
        </button>
        <button className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium transition-colors shadow-md">
          <Link to="/register">Get Started</Link>
        </button>
      </div>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Empowering Farmers Through Digital Innovation
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with expert agricultural consultants, manage your farms efficiently, and grow sustainably with Mlimi Anyamuke Initiative
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-yellow-500 text-green-900 rounded-lg hover:bg-yellow-400 font-semibold text-lg transition-colors shadow-xl">
                <Link to="/register">Get Started</Link>
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/20 backdrop-blur-sm font-semibold text-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Mlimi Anyamuke is dedicated to transforming African agriculture through technology. 
              We bridge the gap between farmers and expert consultants, providing digital tools 
              for farm management, expert advisory services, and data-driven sustainability insights 
              that empower communities and improve yields.
            </p>
          </div>
        </div>
      </section>

      {/* Today's Insights */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Today's Agricultural Insights
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Stay informed with daily updates on weather, market trends, and farming tips
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Sun className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Weather Alert</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Blantyre Region</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">28°C</p>
              <p className="text-sm text-gray-600">Partly cloudy with 60% chance of rain tomorrow</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Market Trends</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">This Week</p>
              <p className="text-lg font-semibold text-green-600 mb-1">Maize ↑ 12%</p>
              <p className="text-sm text-gray-600">Strong demand driving prices up in local markets</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Farming Tip</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">Season Advisory</p>
              <p className="text-sm text-gray-900 font-medium mb-1">Optimal planting window</p>
              <p className="text-sm text-gray-600">Begin preparing fields for the upcoming rainy season</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Lessons */}
      <section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
      Latest Farming Lessons
    </h2>
    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      Free educational content to help you improve your farming practices
    </p>
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {[
        {
          id: "soil-health",
          title: "Soil Health Management",
          description: "Learn how to test and improve your soil quality for better yields",
          duration: "5 min read",
          category: "Fundamentals"
        },
        {
          id: "water-conservation",
          title: "Water Conservation Techniques",
          description: "Discover efficient irrigation methods that save water and reduce costs",
          duration: "7 min read",
          category: "Sustainability"
        },
        {
          id: "pest-control",
          title: "Pest Control Best Practices",
          description: "Natural and effective ways to protect your crops from common pests",
          duration: "6 min read",
          category: "Crop Protection"
        },
        {
          id: "crop-rotation",
          title: "Crop Rotation Strategies",
          description: "Maximize your land's productivity with proven rotation techniques",
          duration: "8 min read",
          category: "Planning"
        }
      ].map((lesson, index) => (
        <Link
          key={index}
          to="/register"
          state={{ redirectTo: `/resources/${lesson.id}` }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all group block"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-6 h-6 text-green-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  {lesson.category}
                </span>
                <span className="text-xs text-gray-500">{lesson.duration}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-green-700 transition-colors">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {lesson.description}
              </p>
              <span className="text-sm text-green-700 font-medium inline-flex items-center gap-1">
                Read more <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
    <div className="text-center mt-12">
      <Link 
        to="/login"
        className="inline-block px-8 py-3 border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 font-semibold transition-colors"
      >
        Sign up to access all lessons →
      </Link>
    </div>
  </div>
</section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Why Choose Mlimi Anyamuke
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for African farmers
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Sprout,
                title: "Farm Management",
                description: "Track your farms, crops, and soil conditions in one place"
              },
              {
                icon: Users,
                title: "Expert Consultants",
                description: "Connect with agricultural experts for personalized guidance"
              },
              {
                icon: LineChart,
                title: "Data Analytics",
                description: "Make informed decisions with weather and yield insights"
              },
              {
                icon: CheckCircle,
                title: "Best Practices",
                description: "Learn sustainable farming methods and techniques"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <Icon className="w-12 h-12 text-green-700 mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-700 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of farmers already benefiting from expert agricultural consultancy
          </p>
          <button className="px-8 py-4 bg-yellow-500 text-green-900 rounded-lg hover:bg-yellow-400 font-semibold text-lg transition-colors shadow-xl">
            <Link to="/register">Create Account Today</Link>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;