import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PairSetup from "./pages/PairSetup";
import AppHome from "./pages/AppHome";
import MessagesPage from "./pages/MessagesPage";
import MoodPage from "./pages/MoodPage";
import AdvisorPage from "./pages/AdvisorPage";
import GoalsPage from "./pages/GoalsPage";
import { ProfilePage } from "./pages/ProfilePage";
import NotificationSettings from "./pages/NotificationSettings";
import MemoryVault from "./pages/MemoryVault";
import MoodAnalytics from "./pages/MoodAnalytics";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pair-setup" element={<PairSetup />} />
            <Route path="/app" element={<AppHome />} />
            <Route path="/app/messages" element={<MessagesPage />} />
            <Route path="/app/mood" element={<MoodPage />} />
            <Route path="/app/mood/analytics" element={<MoodAnalytics />} />
            <Route path="/app/goals" element={<GoalsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/calendar" element={<CalendarPage />} />
            <Route path="/memory-vault" element={<MemoryVault />} />
            <Route path="/app/advisor" element={<AdvisorPage />} />
            <Route path="/app/notification-settings" element={<NotificationSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
