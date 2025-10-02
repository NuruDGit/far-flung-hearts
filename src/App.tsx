import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { useAppOptimization } from "@/hooks/useAppOptimization";
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

const App = () => {
  useAppOptimization();
  
  return (
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
            <Route path="/app/mood/analytics" element={
              <SubscriptionGuard requiredTier="premium" featureName="Mood Analytics">
                <MoodAnalytics />
              </SubscriptionGuard>
            } />
            <Route path="/app/goals" element={
              <SubscriptionGuard requiredTier="premium" featureName="Relationship Goals">
                <GoalsPage />
              </SubscriptionGuard>
            } />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/calendar" element={<CalendarPage />} />
            <Route path="/app/memory-vault" element={
              <SubscriptionGuard requiredTier="premium" featureName="Memory Vault">
                <MemoryVault />
              </SubscriptionGuard>
            } />
            <Route path="/app/advisor" element={
              <SubscriptionGuard requiredTier="premium" featureName="Love Advisor AI">
                <AdvisorPage />
              </SubscriptionGuard>
            } />
            <Route path="/app/notification-settings" element={<NotificationSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
