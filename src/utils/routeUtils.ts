
export const dashboardRoutes = {
  // Main dashboard
  dashboard: '/dashboard',
  
  // Analysis pages
  posts: '/dashboard/posts',
  upload: '/dashboard/upload',
  reports: '/dashboard/reports',
  alerts: '/dashboard/alerts',
  settings: '/dashboard/settings',
  
  // Analytics pages
  sentiment: '/dashboard/sentiment',
  categories: '/dashboard/categories',
  platforms: '/dashboard/platforms',
  topics: '/dashboard/topics',
  dialects: '/dashboard/dialects',
  
  // Admin routes
  adminUsers: '/admin/users',
  adminPlans: '/admin/plans',
  adminSubscriptions: '/admin/subscriptions',
  adminTransactions: '/admin/transactions',
  adminSettings: '/admin/settings'
} as const;

export type DashboardRoute = typeof dashboardRoutes[keyof typeof dashboardRoutes];

export const isValidRoute = (path: string): path is DashboardRoute => {
  return Object.values(dashboardRoutes).includes(path as DashboardRoute);
};
