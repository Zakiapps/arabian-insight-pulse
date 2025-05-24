
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced with better animations and visual effects
export function CategoryDistribution() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [animationKey, setAnimationKey] = useState(0);

  // Sample data - this would come from your API
  const data = [
    { name: 'سياسة', value: 35, color: '#3b82f6' },
    { name: 'رياضة', value: 25, color: '#10b981' },
    { name: 'اقتصاد', value: 15, color: '#f59e0b' },
    { name: 'ترفيه', value: 10, color: '#ef4444' },
    { name: 'تكنولوجيا', value: 15, color: '#8b5cf6' },
  ];
  
  // When tab changes, trigger animation
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setAnimationKey(prev => prev + 1);
  };

  // Format the label for the tooltip
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border shadow-md rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
            <p>{payload[0].value}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">توزيع الفئات</CardTitle>
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="trending">الشائع</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>توزيع المحتوى حسب الفئات</CardDescription>
      </CardHeader>
      <CardContent className="p-1 h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={animationKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  innerRadius={60}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={0}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default CategoryDistribution;
