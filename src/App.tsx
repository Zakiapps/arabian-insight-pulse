
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
import Posts from "@/pages/Posts";
import Upload from "@/pages/Upload";
import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import SentimentAnalysis from "@/pages/SentimentAnalysis";
import CategoryDistribution from "@/pages/CategoryDistribution";
import PlatformDistribution from "@/pages/PlatformDistribution";
import TopTopics from "@/pages/TopTopics";
import DialectDetection from "@/pages/DialectDetection";
import Settings from "@/pages/Settings";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminSettings from "@/pages/admin/AdminSettings";
import PaymentSettings from "@/pages/admin/PaymentSettings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <SubscriptionProvider>
                <TooltipProvider>
                  <Toaster />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
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
                      <Route path="posts" element={<Posts />} />
                      <Route path="upload" element={<Upload />} />
                      <Route path="alerts" element={<Alerts />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="sentiment" element={<SentimentAnalysis />} />
                      <Route path="categories" element={<CategoryDistribution />} />
                      <Route path="platforms" element={<PlatformDistribution />} />
                      <Route path="topics" element={<TopTopics />} />
                      <Route path="dialects" element={<DialectDetection />} />
                      <Route path="settings" element={<Settings />} />
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
                      <Route path="payment-settings" element={<PaymentSettings />} />
                    </Route>
                  </Routes>
                </TooltipProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
