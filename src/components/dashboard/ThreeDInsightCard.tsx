
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreeDInsightView from "@/components/visualizations/ThreeDInsightView";

interface ThreeDInsightCardProps {
  sentimentData?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export const ThreeDInsightCard = ({ sentimentData = { positive: 42, neutral: 35, negative: 23 } }: ThreeDInsightCardProps) => {
  const [viewMode, setViewMode] = useState("3d");

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>رؤية ثلاثية الأبعاد للتحليل العاطفي</CardTitle>
          <CardDescription>
            عرض تفاعلي ثلاثي الأبعاد للمشاعر في المنشورات الاجتماعية
          </CardDescription>
        </div>
        <Tabs defaultValue="3d" className="w-32" onValueChange={setViewMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="2d">2D</TabsTrigger>
            <TabsTrigger value="3d">3D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ThreeDInsightView sentimentData={sentimentData} />
      </CardContent>
    </Card>
  );
};
