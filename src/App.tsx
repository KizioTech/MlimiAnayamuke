import { Suspense, lazy, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Consultant = lazy(() => import("./pages/Consultant"));
const Admin = lazy(() => import("./pages/Admin"));
const AddFarm = lazy(() => import("./pages/AddFarm"));
const FarmDetail = lazy(() => import("./pages/FarmDetail"));
const ConsultationPage = lazy(() => import("./pages/ConsultationPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Training = lazy(() => import("./pages/Training"));
const Downloads = lazy(() => import("./pages/Downloads"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/farmer/dashboard" element={<Dashboard />} />
             <Route path="/farmer/farm/:id" element={<FarmDetail />} />
             <Route path="/farm/new" element={<AddFarm />} />
             <Route path="/consultations" element={<ConsultationPage />} />
             <Route path="/consultant" element={<Consultant />} />
             <Route path="/admin" element={<Admin />} />
             <Route path="/training" element={<Training />} />
             <Route path="/downloads" element={<Downloads />} />
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
