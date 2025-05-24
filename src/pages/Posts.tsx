
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Posts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<string>("");

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = filterSentiment === "" || post.sentiment === filterSentiment;
    return matchesSearch && matchesSentiment;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">المنشورات المحللة</h1>
          <p className="text-muted-foreground">
            عرض وتصفية جميع المنشورات التي تم تحليلها ({filteredPosts.length} منشور)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المنشورات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="">جميع المشاعر</option>
              <option value="positive">إيجابي</option>
              <option value="negative">سلبي</option>
              <option value="neutral">محايد</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                {posts?.length === 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">لا توجد منشورات محللة</h3>
                    <p>ابدأ برفع بعض البيانات لرؤية المنشورات المحللة هنا</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
                    <p>لم يتم العثور على منشورات تطابق معايير البحث</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-4 leading-relaxed" dir="rtl">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={
                          post.sentiment === 'positive' ? 'default' : 
                          post.sentiment === 'negative' ? 'destructive' : 'secondary'
                        }
                      >
                        {post.sentiment === 'positive' ? 'إيجابي' : 
                         post.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                      </Badge>
                      {post.is_jordanian_dialect && (
                        <Badge variant="outline">اللهجة الأردنية</Badge>
                      )}
                      {post.source && (
                        <Badge variant="outline">{post.source}</Badge>
                      )}
                      {post.sentiment_score && (
                        <Badge variant="secondary">
                          الثقة: {Math.round(post.sentiment_score * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-left">
                    <div>{new Date(post.created_at).toLocaleDateString('ar-SA')}</div>
                    <div>{new Date(post.created_at).toLocaleTimeString('ar-SA')}</div>
                    {post.engagement_count && (
                      <div className="mt-1">التفاعل: {post.engagement_count.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
