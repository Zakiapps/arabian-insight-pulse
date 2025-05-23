
import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SentimentAnalysis } from "@/components/dashboard/SentimentAnalysis";
import { CategoryDistribution } from "@/components/dashboard/CategoryDistribution";
import { TopTopics } from "@/components/dashboard/TopTopics";
import { PlatformDistribution } from "@/components/dashboard/PlatformDistribution";
import { DialectDetection } from "@/components/dashboard/DialectDetection";
import { ThreeDInsightCard } from "@/components/dashboard/ThreeDInsightCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const Dashboard = () => {
  // Sentiment data for 3D visualization
  const sentimentData = {
    positive: 42,
    neutral: 35, 
    negative: 23
  };

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <SentimentAnalysis />
        <CategoryDistribution />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopTopics />
        <PlatformDistribution />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <DialectDetection />
      </div>

      <ThreeDInsightCard sentimentData={sentimentData} />
    </div>
  );
};

export default Dashboard;
