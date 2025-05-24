
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
import Pricing from "./pages/Pricing";
import Reports from "./pages/Reports";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminUsers from "./pages/admin/AdminUsers";
import TextAnalysis from "./pages/TextAnalysis";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <LanguageProvider>
          <div dir="rtl">
            <Router>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/text-analysis" element={<TextAnalysis />} />
                </Routes>
                <Toaster />
              </AuthProvider>
            </Router>
          </div>
        </LanguageProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
