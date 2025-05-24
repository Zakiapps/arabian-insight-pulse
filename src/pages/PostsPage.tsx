
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Filter, Download, Upload, Globe, Heart, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PostsPage = () => {
  const { isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [dialectFilter, setDialectFilter] = useState<string>("all");

  // Fetch real posts data
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', user?.id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('analyzed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin, only show user's own posts
      if (!isAdmin && user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Filter posts based on search and filters
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === "all" || post.sentiment === sentimentFilter;
    const matchesDialect = dialectFilter === "all" || 
      (dialectFilter === "jordanian" && post.is_jordanian_dialect) ||
      (dialectFilter === "non-jordanian" && !post.is_jordanian_dialect);
    
    return matchesSearch && matchesSentiment && matchesDialect;
  }) || [];

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-500">إيجابي</Badge>;
      case 'negative':
        return <Badge variant="destructive">سلبي</Badge>;
      default:
        return <Badge variant="secondary">محايد</Badge>;
    }
  };

  const handleUploadClick = () => {
    navigate('/dashboard/upload');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">المنشورات المحللة</h1>
        <p className="text-muted-foreground">
          عرض وتحليل جميع المنشورات ({filteredPosts.length} من {posts?.length || 0})
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث في المحتوى</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في النصوص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">فلترة المشاعر</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشاعر</SelectItem>
                  <SelectItem value="positive">إيجابي</SelectItem>
                  <SelectItem value="negative">سلبي</SelectItem>
                  <SelectItem value="neutral">محايد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">فلترة اللهجة</label>
              <Select value={dialectFilter} onValueChange={setDialectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع اللهجات</SelectItem>
                  <SelectItem value="jordanian">أردنية</SelectItem>
                  <SelectItem value="non-jordanian">غير أردنية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={handleUploadClick} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                رفع بيانات جديدة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {getSentimentBadge(post.sentiment)}
                    {post.is_jordanian_dialect && (
                      <Badge variant="outline">أردني</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(post.created_at).toLocaleDateString('ar')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3" dir="rtl">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{post.source || 'غير محدد'}</span>
                  </div>
                  
                  {post.sentiment_score && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{Math.round(post.sentiment_score * 100)}%</span>
                    </div>
                  )}
                  
                  {post.engagement_count && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.engagement_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {posts?.length === 0 ? 'لا توجد منشورات محللة' : 'لا توجد نتائج مطابقة'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {posts?.length === 0 
                ? 'ابدأ بتحليل بعض البيانات لرؤية النتائج هنا'
                : 'جرب تعديل معايير البحث أو الفلترة'
              }
            </p>
            {posts?.length === 0 && (
              <Button onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                رفع بيانات جديدة
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PostsPage;
