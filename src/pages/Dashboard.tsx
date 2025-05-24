
import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SentimentAnalysis } from "@/components/dashboard/SentimentAnalysis";
import { CategoryDistribution } from "@/components/dashboard/CategoryDistribution";
import { TopTopics } from "@/components/dashboard/TopTopics";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { DialectDetection } from "@/components/dashboard/DialectDetection";
import { ThreeDInsightCard } from "@/components/dashboard/ThreeDInsightCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // Sentiment data for 3D visualization
  const sentimentData = {
    positive: 42,
    neutral: 35, 
    negative: 23
  };
  
  const { subscriptionTier } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader />
        <SubscriptionBadge className="ml-2" />
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <FeatureGuard featureName="basic-analytics">
          <CategoryDistribution />
        </FeatureGuard>
        
        <FeatureGuard featureName="sentiment-analysis">
          <SentimentAnalysis />
        </FeatureGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FeatureGuard featureName="basic-analytics">
          <TopTopics />
        </FeatureGuard>
        
        <FeatureGuard featureName="basic-analytics">
          <PlatformDistribution />
        </FeatureGuard>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <FeatureGuard 
          featureName="dialect-detection"
          fallback={
            <Card className="col-span-7 lg:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  كشف اللهجة
                  <Crown className="h-5 w-5 text-amber-500" />
                </CardTitle>
                <CardDescription>
                  هذه الميزة متاحة فقط للمشتركين في الباقة Premium وما فوق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6">
                  <Button onClick={() => navigate('/pricing')} variant="outline">
                    تحديث الاشتراك
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          }
        >
          <DialectDetection />
        </FeatureGuard>
      </div>

      <FeatureGuard featureName="advanced-reporting">
        <ThreeDInsightCard sentimentData={sentimentData} />
      </FeatureGuard>
    </div>
  );
};

export default Dashboard;
