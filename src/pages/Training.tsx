import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Award, CheckCircle, Circle, Download, Search, Users, Sprout, ChevronRight, Play, Lock, Clock, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const Training = () => {
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [selectedModule, setSelectedModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('Zomba, Malawi');

  const trainingModules = {
    farmer: [
      {
        id: 'f1',
        title: 'Getting Started with Mlimi Anyamuke',
        duration: '15 min',
        type: 'video',
        description: 'Learn how to create your account and set up your first farm profile',
        lessons: [
          'Creating your account',
          'Understanding the dashboard',
          'Adding your farm details',
          'Setting up location on map'
        ]
      },
      {
        id: 'f2',
        title: 'Farm Profile Management',
        duration: '20 min',
        type: 'interactive',
        description: 'Master farm data entry including crops, soil types, and farm boundaries',
        lessons: [
          'Adding multiple farms',
          'Updating crop information',
          'Recording soil test results',
          'Managing farm size and boundaries'
        ]
      },
      {
        id: 'f3',
        title: 'Requesting Consultations',
        duration: '12 min',
        type: 'video',
        description: 'How to effectively communicate issues and get expert advice',
        lessons: [
          'Writing clear problem descriptions',
          'Taking quality photos',
          'Understanding consultant responses',
          'Following up on recommendations'
        ]
      },
      {
        id: 'f4',
        title: 'Understanding Weather Data',
        duration: '18 min',
        type: 'document',
        description: 'Use weather insights to make informed farming decisions',
        lessons: [
          'Reading weather forecasts',
          'Planning with rainfall data',
          'Temperature impact on crops',
          'Seasonal planning tips'
        ]
      },
      {
        id: 'f5',
        title: 'Sustainable Farming Practices',
        duration: '30 min',
        type: 'video',
        description: 'Learn modern sustainable agriculture techniques',
        lessons: [
          'Soil health management',
          'Water conservation methods',
          'Organic pest control',
          'Crop rotation strategies'
        ]
      },
      {
        id: 'f6',
        title: 'AI Recommendations Guide',
        duration: '10 min',
        type: 'interactive',
        description: 'How to interpret and apply AI-generated farming insights',
        lessons: [
          'Understanding AI suggestions',
          'Implementing recommendations',
          'Tracking results',
          'Providing feedback'
        ]
      }
    ],
    consultant: [
      {
        id: 'c1',
        title: 'Consultant Onboarding',
        duration: '25 min',
        type: 'video',
        description: 'Introduction to the consultant role and platform workflows',
        lessons: [
          'Platform navigation for consultants',
          'Understanding your dashboard',
          'Managing farmer assignments',
          'Response time expectations'
        ]
      },
      {
        id: 'c2',
        title: 'Effective Advisory Techniques',
        duration: '35 min',
        type: 'interactive',
        description: 'Best practices for providing actionable farmer advice',
        lessons: [
          'Assessing farmer needs',
          'Structuring recommendations',
          'Clear communication strategies',
          'Follow-up protocols'
        ]
      },
      {
        id: 'c3',
        title: 'Crop Disease Identification',
        duration: '45 min',
        type: 'document',
        description: 'Reference guide for common crop diseases and treatments',
        lessons: [
          'Visual disease identification',
          'Pest management strategies',
          'Treatment recommendations',
          'Prevention techniques'
        ]
      },
      {
        id: 'c4',
        title: 'Soil Management Expertise',
        duration: '40 min',
        type: 'video',
        description: 'Advanced soil health assessment and improvement',
        lessons: [
          'Soil testing interpretation',
          'Nutrient management',
          'pH balance correction',
          'Organic matter improvement'
        ]
      },
      {
        id: 'c5',
        title: 'Case Studies & Success Stories',
        duration: '30 min',
        type: 'interactive',
        description: 'Learn from real consultation examples and outcomes',
        lessons: [
          'Successful interventions',
          'Problem-solving approaches',
          'Farmer feedback analysis',
          'Impact measurement'
        ]
      },
      {
        id: 'c6',
        title: 'Digital Communication Skills',
        duration: '20 min',
        type: 'video',
        description: 'Effective remote consultation techniques',
        lessons: [
          'Written communication tips',
          'Photo-based diagnosis',
          'Building farmer trust',
          'Cultural sensitivity'
        ]
      }
    ],
    admin: [
      {
        id: 'a1',
        title: 'Admin Panel Overview',
        duration: '20 min',
        type: 'video',
        description: 'Complete guide to admin dashboard and capabilities',
        lessons: [
          'Dashboard navigation',
          'User management tools',
          'Analytics overview',
          'System settings'
        ]
      },
      {
        id: 'a2',
        title: 'User Management & Approval',
        duration: '15 min',
        type: 'interactive',
        description: 'Managing farmer and consultant registrations',
        lessons: [
          'Reviewing applications',
          'Approval criteria',
          'Account deactivation',
          'Role management'
        ]
      },
      {
        id: 'a3',
        title: 'Platform Analytics',
        duration: '30 min',
        type: 'document',
        description: 'Understanding and utilizing platform metrics',
        lessons: [
          'Key performance indicators',
          'User engagement metrics',
          'Consultation statistics',
          'Growth tracking'
        ]
      },
      {
        id: 'a4',
        title: 'Quality Assurance',
        duration: '25 min',
        type: 'video',
        description: 'Monitoring consultation quality and platform health',
        lessons: [
          'Consultation review process',
          'Quality standards',
          'Feedback management',
          'Performance monitoring'
        ]
      },
      {
        id: 'a5',
        title: 'Support & Troubleshooting',
        duration: '20 min',
        type: 'interactive',
        description: 'Handling user issues and technical problems',
        lessons: [
          'Common user issues',
          'Escalation procedures',
          'Technical support basics',
          'Documentation practices'
        ]
      }
    ]
  };

  const resources = [
    {
      title: 'Quick Start Guide',
      type: 'PDF',
      size: '2.3 MB',
      language: 'English / Chichewa',
      icon: FileText
    },
    {
      title: 'Agricultural Calendar 2025',
      type: 'PDF',
      size: '1.8 MB',
      language: 'English / Chichewa',
      icon: FileText
    },
    {
      title: 'Crop Disease Reference',
      type: 'PDF',
      size: '5.4 MB',
      language: 'English',
      icon: FileText
    },
    {
      title: 'Platform User Manual',
      type: 'PDF',
      size: '3.2 MB',
      language: 'English / Chichewa',
      icon: BookOpen
    }
  ];

  const toggleModuleCompletion = (moduleId) => {
    setIsLoading(true);
    setTimeout(() => {
      if (completedModules.includes(moduleId)) {
        setCompletedModules(completedModules.filter(id => id !== moduleId));
      } else {
        setCompletedModules([...completedModules, moduleId]);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== module.id);
      return [module, ...filtered].slice(0, 3);
    });
  };

  const getProgressPercentage = () => {
    const totalModules = trainingModules[selectedRole].length;
    const completed = trainingModules[selectedRole].filter(m =>
      completedModules.includes(m.id)
    ).length;
    return Math.round((completed / totalModules) * 100);
  };

  const getTotalEstimatedTime = () => {
    return trainingModules[selectedRole].reduce((total, module) => {
      const minutes = parseInt(module.duration);
      return total + minutes;
    }, 0);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'interactive': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const filteredModules = trainingModules[selectedRole].filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserName(typeof profile.name === 'string' ? profile.name : '');
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} userLocation={userLocation} />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Sprout className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Training Portal</h1>
          </div>
          <p className="text-green-100 text-lg max-w-2xl">
            Empowering farmers, consultants, and administrators with knowledge and skills to maximize the Mlimi Anyamuke platform
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Role Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Select Your Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'farmer', label: 'Farmer', icon: Sprout, desc: 'Farm management & consultation' },
              { id: 'consultant', label: 'Consultant', icon: Users, desc: 'Advisory & support training' },
              { id: 'admin', label: 'Administrator', icon: Award, desc: 'Platform management' }
            ].map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setSelectedModule(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${selectedRole === role.id ? 'text-green-600' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-lg mb-1">{role.label}</h3>
                  <p className="text-sm text-gray-600">{role.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Your Progress</h3>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {completedModules.length} of {trainingModules[selectedRole].length} modules completed
              </p>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Estimated total time: {Math.round(getTotalEstimatedTime() / 60)}h {getTotalEstimatedTime() % 60}m
              </p>
              {getProgressPercentage() === 100 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold">Certificate Ready!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Recently Viewed
                </h3>
                <div className="space-y-3">
                  {recentlyViewed.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                      onClick={() => setSelectedModule(module)}
                    >
                      {getTypeIcon(module.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{module.title}</h4>
                        <p className="text-xs text-gray-500">{module.duration}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Downloadable Resources
              </h3>
              <div className="space-y-3">
                {resources.map((resource, idx) => {
                  const Icon = resource.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                      <Icon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                        <p className="text-xs text-gray-500">
                          {resource.type} • {resource.size} • {resource.language}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search training modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Module Details View */}
            {selectedModule ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-green-600 hover:text-green-700 mb-4 flex items-center gap-1 text-sm font-medium"
                >
                  ← Back to modules
                </button>
                
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedModule.title}</h2>
                      <p className="text-gray-600">{selectedModule.description}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      {getTypeIcon(selectedModule.type)}
                      <span className="capitalize">{selectedModule.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                    <span>⏱ {selectedModule.duration}</span>
                    <span>📝 {selectedModule.lessons.length} lessons</span>
                  </div>

                  {/* Video Player Placeholder */}
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-green-700 transition-colors">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                      <p className="text-white text-lg font-medium">Start Training Module</p>
                      <p className="text-gray-400 text-sm mt-1">{selectedModule.duration}</p>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Module Content</h3>
                    <div className="space-y-2">
                      {selectedModule.lessons.map((lesson, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="flex-1">{lesson}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => toggleModuleCompletion(selectedModule.id)}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        completedModules.includes(selectedModule.id)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </div>
                      ) : (
                        completedModules.includes(selectedModule.id) ? '✓ Completed' : 'Mark as Complete'
                      )}
                    </button>
                    {completedModules.includes(selectedModule.id) && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg">
                        <Star className="w-5 h-5" />
                        <span className="font-medium">Achievement Unlocked!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Module List */
              <div className="space-y-4">
                {filteredModules.map((module) => {
                  const isCompleted = completedModules.includes(module.id);
                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-transparent hover:border-green-600"
                      onClick={() => handleModuleSelect(module)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleModuleSelect(module);
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select ${module.title} training module`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              getTypeIcon(module.type)
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                              {module.title}
                              {isCompleted && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Completed
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                {getTypeIcon(module.type)}
                                <span className="capitalize">{module.type}</span>
                              </span>
                              <span>⏱ {module.duration}</span>
                              <span>📝 {module.lessons.length} lessons</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}

                {filteredModules.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No modules found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">How do I get my certificate?</h3>
              <p className="text-gray-600 text-sm">Complete all training modules for your role to unlock your digital certificate.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I access training offline?</h3>
              <p className="text-gray-600 text-sm">Download PDF resources for offline access. Video content requires internet connection.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How long does training take?</h3>
              <p className="text-gray-600 text-sm">Most role-based training can be completed in 2-3 hours at your own pace.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Need help?</h3>
              <p className="text-gray-600 text-sm">Contact support at support@mlimi-anyamuke.com or call +265 123 456 789</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Training;