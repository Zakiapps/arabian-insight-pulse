
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import pages
import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import TextAnalysis from "@/pages/TextAnalysis";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AdminLayout from "@/components/layouts/AdminLayout";

// Dashboard pages
import Dashboard from "@/pages/Dashboard";
import PostsPage from "@/pages/PostsPage";
import UploadPage from "@/pages/UploadPage";
import AlertsPage from "@/pages/AlertsPage";
import ReportsPage from "@/pages/ReportsPage";
import SentimentAnalysisPage from "@/pages/SentimentAnalysisPage";
import CategoryDistributionPage from "@/pages/CategoryDistributionPage";
import PlatformDistributionPage from "@/pages/PlatformDistributionPage";
import TopTopicsPage from "@/pages/TopTopicsPage";
import DialectDetectionPage from "@/pages/DialectDetection";
import SettingsPage from "@/pages/SettingsPage";

// Admin pages
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminPlans from "@/pages/AdminPlans";
import AdminSubscriptions from "@/pages/AdminSubscriptions";
import AdminTransactions from "@/pages/AdminTransactions";
import AdminSettings from "@/pages/AdminSettings";
import AdminPaymentSettings from "@/pages/AdminPaymentSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/text-analysis" element={<TextAnalysis />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<SignIn />} />
                    
                    {/* Protected Dashboard routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="posts" element={<PostsPage />} />
                      <Route path="upload" element={<UploadPage />} />
                      <Route path="alerts" element={<AlertsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="sentiment" element={<SentimentAnalysisPage />} />
                      <Route path="categories" element={<CategoryDistributionPage />} />
                      <Route path="platforms" element={<PlatformDistributionPage />} />
                      <Route path="topics" element={<TopTopicsPage />} />
                      <Route path="dialects" element={<DialectDetectionPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Protected Admin routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="plans" element={<AdminPlans />} />
                      <Route path="subscriptions" element={<AdminSubscriptions />} />
                      <Route path="transactions" element={<AdminTransactions />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="payment-settings" element={<AdminPaymentSettings />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
