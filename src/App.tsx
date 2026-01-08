import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Submissions from "./pages/Submissions";
import Earnings from "./pages/Earnings";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AuthCallback from '@/pages/AuthCallback';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} /> {/* ADD THIS LINE */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
