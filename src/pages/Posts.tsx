
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, Download, RefreshCw } from "lucide-react";

interface Post {
  id: string;
  content: string;
  sentiment: string;
  sentiment_score: number;
  is_jordanian_dialect: boolean;
  source: string;
  engagement_count: number;
  created_at: string;
}

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [dialectFilter, setDialectFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch only real posts (exclude dummy/system generated posts)
      const { data, error } = await supabase
        .from('analyzed_posts')
        .select('*')
        .eq('user_id', user?.id)
        .not('source', 'eq', 'dummy') // Exclude dummy posts
        .not('source', 'eq', 'system') // Exclude system posts
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("خطأ في جلب المنشورات");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === "all" || post.sentiment === sentimentFilter;
    const matchesDialect = dialectFilter === "all" || 
      (dialectFilter === "jordanian" && post.is_jordanian_dialect) ||
      (dialectFilter === "non-jordanian" && !post.is_jordanian_dialect);
    const matchesSource = sourceFilter === "all" || post.source === sourceFilter;

    return matchesSearch && matchesSentiment && matchesDialect && matchesSource;
  });

  const exportToCsv = () => {
    if (filteredPosts.length === 0) {
      toast.error("لا توجد منشورات للتصدير");
      return;
    }

    const headers = ['المحتوى', 'المشاعر', 'درجة الثقة', 'اللهجة الأردنية', 'المصدر', 'التفاعل', 'التاريخ'];
    const csvContent = [
      headers.join(','),
      ...filteredPosts.map(post => [
        `"${post.content.replace(/"/g, '""')}"`,
        post.sentiment,
        post.sentiment_score?.toFixed(2) || '0',
        post.is_jordanian_dialect ? 'نعم' : 'لا',
        post.source,
        post.engagement_count || 0,
        new Date(post.created_at).toLocaleDateString('ar-SA')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `posts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("تم تصدير المنشورات بنجاح");
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-500">إيجابي</Badge>;
      case 'negative':
        return <Badge className="bg-red-500">سلبي</Badge>;
      case 'neutral':
        return <Badge variant="secondary">محايد</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const uniqueSources = Array.from(new Set(posts.map(post => post.source)));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المنشورات المحللة</h1>
          <p className="text-muted-foreground">عرض وتصفية المنشورات التي تم تحليلها</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPosts}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={exportToCsv}
            disabled={filteredPosts.length === 0}
            size="sm"
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة المنشورات
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر للبحث عن منشورات محددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث في المحتوى</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المحتوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المشاعر</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المشاعر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشاعر</SelectItem>
                  <SelectItem value="positive">إيجابي</SelectItem>
                  <SelectItem value="neutral">محايد</SelectItem>
                  <SelectItem value="negative">سلبي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اللهجة</label>
              <Select value={dialectFilter} onValueChange={setDialectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع اللهجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع اللهجات</SelectItem>
                  <SelectItem value="jordanian">أردنية</SelectItem>
                  <SelectItem value="non-jordanian">غير أردنية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المصدر</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المصادر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المصادر</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النتائج ({filteredPosts.length} منشور)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد منشورات تطابق معايير البحث
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المحتوى</TableHead>
                    <TableHead>المشاعر</TableHead>
                    <TableHead>الثقة</TableHead>
                    <TableHead>اللهجة</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>التفاعل</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={post.content}>
                          {post.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSentimentBadge(post.sentiment)}
                      </TableCell>
                      <TableCell>
                        {post.sentiment_score ? `${(post.sentiment_score * 100).toFixed(1)}%` : 'غير محدد'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.is_jordanian_dialect ? "default" : "secondary"}>
                          {post.is_jordanian_dialect ? 'أردنية' : 'غير أردنية'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.source}</Badge>
                      </TableCell>
                      <TableCell>{post.engagement_count || 0}</TableCell>
                      <TableCell>
                        {new Date(post.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
