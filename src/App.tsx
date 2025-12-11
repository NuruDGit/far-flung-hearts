import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { useAppOptimization } from "@/hooks/useAppOptimization";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { CookieConsent } from "@/components/CookieConsent";
import { lazy, Suspense } from "react";

// Immediate load pages (authentication & landing)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PairSetup from "./pages/PairSetup";
import Onboarding from "./pages/Onboarding";
import AppHome from "./pages/AppHome";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MemoryVault = lazy(() => import("./pages/MemoryVault"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const MoodAnalytics = lazy(() => import("./pages/MoodAnalytics"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const MoodPage = lazy(() => import("./pages/MoodPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const GamesPage = lazy(() => import("./pages/GamesPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const DailyQuestionAnswers = lazy(() => import("./pages/DailyQuestionAnswers"));
const Security = lazy(() => import("./pages/Security"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const HelpArticle = lazy(() => import("./pages/HelpArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const Community = lazy(() => import("./pages/Community"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

const queryClient = new QueryClient();

const App = () => {
  // Temporarily disabled to avoid duplicate React hook runtime issue; re-enable after bundler dedupe is stable
  // useAppOptimization();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CookieConsent />
            {/* <PWAInstallPrompt /> */}
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pair-setup" element={<PairSetup />} />
                <Route path="/onboarding" element={<Onboarding />} />
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
                <Route path="/app/notification-settings" element={<NotificationSettings />} />
                <Route path="/app/subscription" element={<SubscriptionPage />} />
                {/* Games and Wishlist are free features accessible to all tiers */}
                <Route path="/app/games" element={<GamesPage />} />
                <Route path="/app/wishlist" element={<WishlistPage />} />
                <Route path="/app/daily-question-answers" element={<DailyQuestionAnswers />} />
                {/* Public pages */}
                <Route path="/security" element={<Security />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/help-center/article/:articleId" element={<HelpArticle />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/community" element={<Community />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
