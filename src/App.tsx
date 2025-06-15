import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProjectAnalysesPage from '@/pages/ProjectAnalysesPage';

// Import pages
import LandingPage from "@/pages/LandingPage";
import BilingualLanding from "@/pages/BilingualLanding";
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

// Project pages
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectPage from "@/pages/ProjectPage";

// Models & Services pages
import SentimentModelPage from "@/pages/models/SentimentModelPage";
import SummarizationModelPage from "@/pages/models/SummarizationModelPage";
import ForecastingPage from "@/pages/models/ForecastingPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminSettings from "@/pages/admin/AdminSettings";
import PaymentSettings from "@/pages/admin/PaymentSettings";
import HuggingFaceConfigPage from "@/pages/admin/HuggingFaceConfig";
import HuggingFaceLogs from "@/pages/admin/HuggingFaceLogs";

const queryClient = new QueryClient();

import UnifiedScraper from "./pages/UnifiedScraper";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ProjectProvider>
            <ConfigProvider>
              <SubscriptionProvider>
                <Router>
                  <div className="min-h-screen bg-background">
                    <Toaster />
                    <Routes>
                      {/* Public routes - Landing page as home */}
                      <Route path="/" element={<BilingualLanding />} />
                      <Route path="/home" element={<BilingualLanding />} />
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
                      
                      {/* Projects routes */}
                      <Route path="/projects" element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<ProjectsPage />} />
                        <Route path=":projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
                        <Route path="/projects/:projectId/analyses" element={<ProtectedRoute><ProjectAnalysesPage /></ProtectedRoute>} />
                      </Route>
                      
                      {/* Models & Services routes */}
                      <Route path="/models" element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }>
                        <Route path="sentiment" element={<SentimentModelPage />} />
                        <Route path="summarization" element={<SummarizationModelPage />} />
                        <Route path="forecasting" element={<ForecastingPage />} />
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
                        <Route path="huggingface-config" element={<HuggingFaceConfigPage />} />
                        <Route path="huggingface-logs" element={<HuggingFaceLogs />} />
                      </Route>
                      
                      {/* Unified Scraper route */}
                      <Route path="/dashboard/unified-scraper" element={<UnifiedScraper />} />
                    </Routes>
                  </div>
                </Router>
              </SubscriptionProvider>
            </ConfigProvider>
          </ProjectProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
