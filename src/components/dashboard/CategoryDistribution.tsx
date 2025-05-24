
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Enhanced with better animations and visual effects and navigation capabilities
export function CategoryDistribution() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [animationKey, setAnimationKey] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sample data - this would come from your API
  const data = [
    { name: 'سياسة', value: 35, color: '#3b82f6', categoryId: 'politics' },
    { name: 'رياضة', value: 25, color: '#10b981', categoryId: 'sports' },
    { name: 'اقتصاد', value: 15, color: '#f59e0b', categoryId: 'economy' },
    { name: 'ترفيه', value: 10, color: '#ef4444', categoryId: 'entertainment' },
    { name: 'تكنولوجيا', value: 15, color: '#8b5cf6', categoryId: 'technology' },
  ];
  
  // When tab changes, trigger animation
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setAnimationKey(prev => prev + 1);
  };

  // Handle category click to navigate to posts
  const handleCategoryClick = (entry: any) => {
    if (entry && entry.categoryId) {
      navigate(`/dashboard/posts?category=${entry.categoryId}`);
    }
  };

  // Format the label for the tooltip
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/95 backdrop-blur-sm p-3 border shadow-xl rounded-md"
        >
          <p className="font-medium text-lg">{payload[0].name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
            <p className="font-bold">{payload[0].value}%</p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom label component with hover effect
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const isHovered = index === hoveredIndex;
    
    return (
      <g>
        <text 
          x={x} 
          y={y} 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          className="fill-current font-medium text-sm"
          style={{ 
            fontWeight: isHovered ? 'bold' : 'normal',
            fontSize: isHovered ? '0.95rem' : '0.8rem',
            transition: 'all 0.3s ease'
          }}
        >
          {`${name}: ${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  // Reference for the card to get dimensions
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card ref={cardRef} className="col-span-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              توزيع الفئات
            </motion.span>
            <motion.div 
              className="bg-primary/10 mr-2 px-2 py-0.5 rounded-full text-xs text-primary"
              animate={{ 
                backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(59, 130, 246, 0.1)'],
                color: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(59, 130, 246)']
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              مباشر
            </motion.div>
          </CardTitle>
          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="all" className="relative overflow-hidden group">
                <span className="relative z-10">الكل</span>
                <motion.span 
                  className="absolute inset-0 bg-primary/10 rounded-sm -z-0"
                  initial={{ x: selectedTab === 'all' ? '0%' : '-100%' }}
                  animate={{ x: selectedTab === 'all' ? '0%' : '-100%' }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </TabsTrigger>
              <TabsTrigger value="trending" className="relative overflow-hidden group">
                <span className="relative z-10">الشائع</span>
                <motion.span 
                  className="absolute inset-0 bg-primary/10 rounded-sm -z-0"
                  initial={{ x: selectedTab === 'trending' ? '0%' : '-100%' }}
                  animate={{ x: selectedTab === 'trending' ? '0%' : '-100%' }}
                  transition={{ type: "spring", stiffness: 100 }}
                />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription className="flex items-center">
          <span>توزيع المحتوى حسب الفئات</span>
          <div className="h-1 w-1 bg-muted-foreground/50 rounded-full mx-1.5" />
          <span className="text-xs text-muted-foreground/70">تحديث قبل 5 دقائق</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-1 h-[300px] relative">
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
                <defs>
                  {data.map((entry, index) => (
                    <filter key={`glow-${index}`} id={`glow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  innerRadius={60}
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                  onClick={handleCategoryClick}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      style={{ 
                        filter: hoveredIndex === index ? `url(#glow-${index})` : 'none',
                        opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.7,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value, entry: any, index) => {
                    return (
                      <span 
                        style={{ 
                          color: 'var(--foreground)', 
                          fontWeight: hoveredIndex === index ? 'bold' : 'normal',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleCategoryClick(data[index])}
                      >
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>

        {/* Background visual effects */}
        <motion.div 
          className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl z-0 pointer-events-none"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </CardContent>
    </Card>
  );
}

export default CategoryDistribution;
