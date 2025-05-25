
export const dashboardRoutes = {
  // Main dashboard
  dashboard: '/dashboard',
  
  // Analysis pages
  posts: '/dashboard/posts',
  upload: '/dashboard/upload',
  reports: '/dashboard/reports',
  alerts: '/dashboard/alerts',
  settings: '/dashboard/settings',
  analysisSettings: '/dashboard/analysis-settings',
  reviews: '/dashboard/reviews',
  
  // Analytics pages - أدوات التحليل (تصحيح الروابط)
  sentimentAnalysis: '/dashboard/sentiment-analysis',
  categoryDistribution: '/dashboard/category-distribution',
  platformDistribution: '/dashboard/platform-distribution',
  topTopics: '/dashboard/top-topics',
  dialectDetection: '/dashboard/dialect-detection',
  
  // Admin routes
  adminDashboard: '/admin',
  adminUsers: '/admin/users',
  adminSocialMedia: '/admin/social-media-scraping',
  adminPlans: '/admin/plans',
  adminSubscriptions: '/admin/subscriptions',
  adminTransactions: '/admin/transactions',
  adminSettings: '/admin/settings',
  adminPaymentSettings: '/admin/payment-settings',
  
  // Public routes
  home: '/',
  textAnalysis: '/text-analysis',
  login: '/login', // تصحيح: استخدام /login بدلاً من /signin
  register: '/register',
  pricing: '/pricing'
} as const;

export type DashboardRoute = typeof dashboardRoutes[keyof typeof dashboardRoutes];

export const isValidRoute = (path: string): path is DashboardRoute => {
  return Object.values(dashboardRoutes).includes(path as DashboardRoute);
};

// Analysis tools navigation helper
export const analysisTools = [
  {
    title: 'تحليل المشاعر',
    description: 'تحليل مفصل لمشاعر المنشورات',
    route: dashboardRoutes.sentimentAnalysis,
    icon: 'TrendingUp'
  },
  {
    title: 'توزيع الفئات',
    description: 'تصنيف المحتوى حسب الفئات',
    route: dashboardRoutes.categoryDistribution,
    icon: 'BarChart3'
  },
  {
    title: 'توزيع المنصات',
    description: 'تحليل البيانات حسب المنصة',
    route: dashboardRoutes.platformDistribution,
    icon: 'Globe'
  },
  {
    title: 'أهم المواضيع',
    description: 'اكتشاف المواضيع الرائجة',
    route: dashboardRoutes.topTopics,
    icon: 'MessageSquare'
  },
  {
    title: 'كشف اللهجة',
    description: 'تمييز اللهجة الأردنية',
    route: dashboardRoutes.dialectDetection,
    icon: 'Languages'
  }
];
