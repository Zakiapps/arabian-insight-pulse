
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import SentimentAnalysis from "@/components/dashboard/SentimentAnalysis";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { TopTopics } from "@/components/dashboard/TopTopics";
import { DialectDetection } from "@/components/dashboard/DialectDetection";
import { ThreeDInsightCard } from "@/components/dashboard/ThreeDInsightCard";

const Dashboard = () => {
  const { isRTL } = useLanguage();

  // Always show the regular dashboard, regardless of user role
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <DashboardHeader />
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <SentimentAnalysis />
        <CategoryDistribution />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformDistribution />
        <TopTopics />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DialectDetection />
        <ThreeDInsightCard />
      </div>
    </div>
  );
};

export default Dashboard;
