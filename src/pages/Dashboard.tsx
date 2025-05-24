
import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import SentimentAnalysis from "@/components/dashboard/SentimentAnalysis";
import TopTopics from "@/components/dashboard/TopTopics";
import CategoryDistribution from "@/components/dashboard/CategoryDistribution";
import PlatformDistribution from "@/components/dashboard/PlatformDistribution";
import DialectDetection from "@/components/dashboard/DialectDetection";

const Dashboard = () => {
  const navigate = useNavigate();

  // Navigation handlers for different sections
  const handleAnalyzedPostsClick = () => {
    navigate('/dashboard/posts');
  };

  const handleSentimentClick = (sentiment: string) => {
    navigate(`/dashboard/posts?sentiment=${sentiment}`);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <div 
        onClick={handleAnalyzedPostsClick}
        className="cursor-pointer"
      >
        <StatsCards />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div 
          onClick={() => handleSentimentClick('all')}
          className="cursor-pointer"
        >
          <SentimentAnalysis onSentimentClick={handleSentimentClick} />
        </div>
        <TopTopics />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CategoryDistribution />
        <PlatformDistribution />
        <DialectDetection />
      </div>
    </div>
  );
};

export default Dashboard;
