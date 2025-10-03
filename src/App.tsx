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
import SubscriptionPage from "./pages/SubscriptionPage";
import NotFound from "./pages/NotFound";
import GamesPage from "./pages/GamesPage";
import WishlistPage from "./pages/WishlistPage";
import DailyQuestionAnswers from "./pages/DailyQuestionAnswers";
import Security from "./pages/Security";
import API from "./pages/API";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";

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
            <Route path="/app/subscription" element={<SubscriptionPage />} />
            {/* Games and Wishlist are free features accessible to all tiers */}
            <Route path="/app/games" element={<GamesPage />} />
            <Route path="/app/wishlist" element={<WishlistPage />} />
            <Route path="/app/daily-question-answers" element={<DailyQuestionAnswers />} />
            {/* Public pages */}
            <Route path="/security" element={<Security />} />
            <Route path="/api" element={<API />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/community" element={<Community />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
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
