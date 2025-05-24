
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "next-themes";

// Layouts
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

// Pages
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Posts from "@/pages/Posts";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import DialectDetection from "@/pages/DialectDetection";
import CategoryDistribution from "@/pages/CategoryDistribution";
import PlatformDistribution from "@/pages/PlatformDistribution";
import TopTopics from "@/pages/TopTopics";
import TextAnalysis from "@/pages/TextAnalysis";
import Reports from "@/pages/Reports";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import AnalysisSettings from "@/pages/AnalysisSettings";
import Pricing from "@/pages/Pricing";
import Reviews from "@/pages/Reviews";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminSettings from "@/pages/admin/AdminSettings";
import PaymentSettings from "@/pages/admin/PaymentSettings";

// Protected Route
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthContextProvider>
          <LanguageProvider>
            <SubscriptionProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/reviews" element={<Reviews />} />

                    {/* Protected dashboard routes */}
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/posts" element={<Posts />} />
                      <Route path="/sentiment-analysis" element={<SentimentAnalysis />} />
                      <Route path="/dialect-detection" element={<DialectDetection />} />
                      <Route path="/category-distribution" element={<CategoryDistribution />} />
                      <Route path="/platform-distribution" element={<PlatformDistribution />} />
                      <Route path="/top-topics" element={<TopTopics />} />
                      <Route path="/text-analysis" element={<TextAnalysis />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/analysis-settings" element={<AnalysisSettings />} />
                    </Route>

                    {/* Protected admin routes */}
                    <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/plans" element={<AdminPlans />} />
                      <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                      <Route path="/admin/transactions" element={<AdminTransactions />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/payment-settings" element={<PaymentSettings />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SubscriptionProvider>
          </LanguageProvider>
        </AuthContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
