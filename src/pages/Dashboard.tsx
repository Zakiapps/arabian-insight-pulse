
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, MessageSquare, Globe, Users, Calendar, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRealData } from '@/hooks/useRealData';

const Dashboard = () => {
  const { stats, loading } = useRealData();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'إيجابي';
      case 'negative': return 'سلبي';
      case 'neutral': return 'محايد';
      default: return sentiment;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            نظرة عامة على تحليلاتك وإحصائياتك
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/upload" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              تحليل نص جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنشورات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              النصوص المحللة إجمالاً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر الإيجابية</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positivePosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPosts > 0 ? `${((stats.positivePosts / stats.totalPosts) * 100).toFixed(1)}%` : '0%'} من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المشاعر السلبية</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.negativePosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPosts > 0 ? `${((stats.negativePosts / stats.totalPosts) * 100).toFixed(1)}%` : '0%'} من المجموع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اللهجة الأردنية</CardTitle>
            <Globe className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.jordanianPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPosts > 0 ? `${((stats.jordanianPosts / stats.totalPosts) * 100).toFixed(1)}%` : '0%'} من المجموع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              آخر التحليلات
            </CardTitle>
            <CardDescription>
              النصوص المحللة مؤخراً
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start justify-between space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {post.content.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={getSentimentColor(post.sentiment)}
                        >
                          {getSentimentLabel(post.sentiment)}
                        </Badge>
                        {post.is_jordanian_dialect && (
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            أردني
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/dashboard/posts">عرض جميع المنشورات</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد نصوص محللة حتى الآن</p>
                <Button asChild>
                  <Link to="/dashboard/upload">ابدأ التحليل الآن</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              توزيع المشاعر
            </CardTitle>
            <CardDescription>
              نظرة عامة على نتائج التحليل
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalPosts > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إيجابي</span>
                    <span className="text-sm font-medium text-green-600">
                      {((stats.positivePosts / stats.totalPosts) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.positivePosts / stats.totalPosts) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">سلبي</span>
                    <span className="text-sm font-medium text-red-600">
                      {((stats.negativePosts / stats.totalPosts) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(stats.negativePosts / stats.totalPosts) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">محايد</span>
                    <span className="text-sm font-medium text-gray-600">
                      {((stats.neutralPosts / stats.totalPosts) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${(stats.neutralPosts / stats.totalPosts) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/dashboard/sentiment">تقرير تفصيلي</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد بيانات لعرضها</p>
                <Button variant="outline" asChild>
                  <Link to="/dashboard/upload">ابدأ التحليل</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>الوصول السريع للوظائف الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link to="/dashboard/upload">
                <Plus className="h-6 w-6 mb-2" />
                <span>تحليل نص</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link to="/dashboard/posts">
                <MessageSquare className="h-6 w-6 mb-2" />
                <span>عرض المنشورات</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link to="/dashboard/reports">
                <FileText className="h-6 w-6 mb-2" />
                <span>التقارير</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link to="/dashboard/settings">
                <Users className="h-6 w-6 mb-2" />
                <span>الإعدادات</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
