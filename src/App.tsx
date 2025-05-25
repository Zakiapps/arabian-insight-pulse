
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "next-themes";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TextAnalysis from "./pages/TextAnalysis";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";
import PaymentSettings from "./pages/admin/PaymentSettings";
import SocialMediaScraping from "./pages/admin/SocialMediaScraping";
import Posts from "./pages/Posts";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import CategoryDistribution from "./pages/CategoryDistribution";
import PlatformDistribution from "./pages/PlatformDistribution";
import TopTopics from "./pages/TopTopics";
import DialectDetection from "./pages/DialectDetection";
import Alerts from "./pages/Alerts";
import Upload from "./pages/Upload";
import AnalysisSettings from "./pages/AnalysisSettings";
import Reviews from "./pages/Reviews";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/text-analysis" element={<TextAnalysis />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<Pricing />} />

                    {/* Protected dashboard routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="posts" element={<Posts />} />
                      <Route path="sentiment-analysis" element={<SentimentAnalysis />} />
                      <Route path="category-distribution" element={<CategoryDistribution />} />
                      <Route path="platform-distribution" element={<PlatformDistribution />} />
                      <Route path="top-topics" element={<TopTopics />} />
                      <Route path="dialect-detection" element={<DialectDetection />} />
                      <Route path="alerts" element={<Alerts />} />
                      <Route path="upload" element={<Upload />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="analysis-settings" element={<AnalysisSettings />} />
                      <Route path="reviews" element={<Reviews />} />
                    </Route>

                    {/* Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="social-media-scraping" element={<SocialMediaScraping />} />
                      <Route path="plans" element={<AdminPlans />} />
                      <Route path="subscriptions" element={<AdminSubscriptions />} />
                      <Route path="transactions" element={<AdminTransactions />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="payment-settings" element={<PaymentSettings />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </SubscriptionProvider>
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
