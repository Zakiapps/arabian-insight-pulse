
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Pricing from "./pages/Pricing";
import Reports from "./pages/Reports";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TextAnalysis from "./pages/TextAnalysis";
import Services from "./pages/Services";
import Reviews from "./pages/Reviews";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Posts from "./pages/Posts";
import Upload from "./pages/Upload";
import Alerts from "./pages/Alerts";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import CategoryDistribution from "./pages/CategoryDistribution";
import PlatformDistribution from "./pages/PlatformDistribution";
import TopTopics from "./pages/TopTopics";
import DialectDetection from "./pages/DialectDetection";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";
import PaymentSettings from "./pages/admin/PaymentSettings";
import DashboardLayout from "./components/layouts/DashboardLayout";
import AdminLayout from "./components/layouts/AdminLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div dir="rtl">
          <Router>
            <AuthProvider>
              <SubscriptionProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/text-analysis" element={<TextAnalysis />} />
                  
                  {/* Dashboard routes with layout */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
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
                  
                  {/* Admin routes with layout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="plans" element={<AdminPlans />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="payment-settings" element={<PaymentSettings />} />
                  </Route>
                </Routes>
                <Toaster />
              </SubscriptionProvider>
            </AuthProvider>
          </Router>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
