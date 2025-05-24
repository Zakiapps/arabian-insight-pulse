
import { useState, useEffect } from "react";
import { Filter, Search, ChevronDown, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryById } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, categories } from "@/lib/utils";

// Mock data for posts - focusing only on Jordanian dialect and adding categories
const samplePosts = [
  {
    id: "p1",
    content: "الحكومة تعلن عن إجراءات جديدة لدعم الاقتصاد المحلي",
    platform: "Twitter",
    sentiment: "positive",
    category: "politics",
    date: "2023-06-10",
    engagement: 245
  },
  {
    id: "p2",
    content: "أسعار المحروقات ترتفع مجدداً والمواطنون يعبرون عن استيائهم",
    platform: "Facebook",
    sentiment: "negative",
    category: "economy",
    date: "2023-06-09",
    engagement: 513
  },
  {
    id: "p3",
    content: "افتتاح معرض للمنتجات المحلية في العاصمة عمان",
    platform: "Twitter",
    sentiment: "positive",
    category: "economy",
    date: "2023-06-08",
    engagement: 189
  },
  {
    id: "p4",
    content: "وزارة التربية تعلن عن نتائج التوجيهي خلال الأسبوع القادم",
    platform: "Facebook",
    sentiment: "neutral",
    category: "education",
    date: "2023-06-08",
    engagement: 782
  },
  {
    id: "p5",
    content: "خبراء الاقتصاد يتوقعون تحسن في أداء السوق المالي",
    platform: "Twitter",
    sentiment: "positive",
    category: "economy",
    date: "2023-06-07",
    engagement: 122
  },
  {
    id: "p6",
    content: "مطالبات بتحسين الخدمات الصحية في المناطق النائية",
    platform: "Facebook",
    sentiment: "negative",
    category: "health",
    date: "2023-06-07",
    engagement: 345
  },
  {
    id: "p7",
    content: "إطلاق مبادرة لدعم المشاريع الصغيرة والمتوسطة",
    platform: "Twitter",
    sentiment: "positive",
    category: "economy",
    date: "2023-06-06",
    engagement: 267
  },
  {
    id: "p8",
    content: "نقابة المعلمين تعلن عن سلسلة مطالب جديدة",
    platform: "Facebook",
    sentiment: "neutral",
    category: "education",
    date: "2023-06-05",
    engagement: 401
  },
];

const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
  const variants: Record<string, string> = {
    positive: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    neutral: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
    negative: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  return (
    <Badge className={cn("capitalize", variants[sentiment])}>
      {sentiment}
    </Badge>
  );
};

const CategoryBadge = ({ category, language }: { category: string, language: string }) => {
  const categoryObj = categories.find(cat => cat.id === category);
  const color = categoryObj ? categoryObj.color.replace('bg-', '') : "gray-500";
  
  return (
    <Badge className={cn(`bg-${color}/10 text-${color} hover:bg-${color}/20`)}>
      {getCategoryById(category, language)}
    </Badge>
  );
};

const Posts = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Check for category filter in URL when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
  }, [location.search]);

  // Update URL when filter changes
  useEffect(() => {
    if (categoryFilter !== 'all') {
      navigate(`/dashboard/posts?category=${categoryFilter}`, { replace: true });
    } else {
      navigate('/dashboard/posts', { replace: true });
    }
  }, [categoryFilter, navigate]);

  const translations = {
    posts: language === 'ar' ? "المنشورات" : "Posts",
    searchDesc: language === 'ar' ? "ابحث وصنف منشورات التواصل الاجتماعي العربية باللهجة الأردنية" : "Search and filter monitored Arabic social media posts in Jordanian dialect",
    export: language === 'ar' ? "تصدير" : "Export",
    exportCSV: language === 'ar' ? "تصدير كملف CSV" : "Export as CSV",
    exportExcel: language === 'ar' ? "تصدير كملف Excel" : "Export as Excel",
    searchFilter: language === 'ar' ? "البحث والتصفية" : "Post Search & Filtering",
    searchFilterDesc: language === 'ar' ? "حدد النتائج حسب النص أو المشاعر أو المنصة أو الفئة" : "Narrow down results by text, sentiment, platform, or category",
    search: language === 'ar' ? "بحث في المنشورات..." : "Search posts...",
    sentiment: language === 'ar' ? "المشاعر" : "Sentiment",
    category: language === 'ar' ? "الفئة" : "Category",
    platform: language === 'ar' ? "المنصة" : "Platform",
    all: language === 'ar' ? "الكل" : "All",
    positive: language === 'ar' ? "إيجابي" : "Positive",
    neutral: language === 'ar' ? "محايد" : "Neutral",
    negative: language === 'ar' ? "سلبي" : "Negative",
    content: language === 'ar' ? "المحتوى" : "Content",
    date: language === 'ar' ? "التاريخ" : "Date",
    engagement: language === 'ar' ? "التفاعل" : "Engagement",
    noPostsFound: language === 'ar' ? "لم يتم العثور على منشورات" : "No posts found",
    tryAdjusting: language === 'ar' ? "حاول تعديل معايير البحث أو التصفية" : "Try adjusting your search or filter criteria",
    showing: language === 'ar' ? "عرض" : "Showing",
    of: language === 'ar' ? "من" : "of",
    previous: language === 'ar' ? "السابق" : "Previous",
    next: language === 'ar' ? "التالي" : "Next",
  };

  // Apply filters
  const filteredPosts = samplePosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || post.sentiment === sentimentFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    return matchesSearch && matchesSentiment && matchesCategory && matchesPlatform;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{translations.posts}</h1>
          <p className="text-muted-foreground">
            {translations.searchDesc}
          </p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4 ml-1 mr-1" />
                {translations.export}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{translations.exportCSV}</DropdownMenuItem>
              <DropdownMenuItem>{translations.exportExcel}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{translations.searchFilter}</CardTitle>
          <CardDescription>
            {translations.searchFilterDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={translations.search}
                className="pl-4 pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder={translations.sentiment} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{translations.sentiment}</SelectLabel>
                  <SelectItem value="all">{translations.all}</SelectItem>
                  <SelectItem value="positive">{translations.positive}</SelectItem>
                  <SelectItem value="neutral">{translations.neutral}</SelectItem>
                  <SelectItem value="negative">{translations.negative}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={translations.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{translations.category}</SelectLabel>
                  <SelectItem value="all">{translations.all}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder={translations.platform} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{translations.platform}</SelectLabel>
                  <SelectItem value="all">{translations.all}</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {paginatedPosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">{translations.content}</TableHead>
                  <TableHead>{translations.platform}</TableHead>
                  <TableHead>{translations.sentiment}</TableHead>
                  <TableHead>{translations.category}</TableHead>
                  <TableHead>{translations.date}</TableHead>
                  <TableHead>{translations.engagement}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium" dir="rtl">{post.content}</TableCell>
                    <TableCell>{post.platform}</TableCell>
                    <TableCell>
                      <SentimentBadge sentiment={post.sentiment} />
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={post.category} language={language} />
                    </TableCell>
                    <TableCell>{post.date}</TableCell>
                    <TableCell>{post.engagement}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{translations.noPostsFound}</h3>
              <p className="text-muted-foreground text-center mt-2">
                {translations.tryAdjusting}
              </p>
            </div>
          )}
        </CardContent>
        {filteredPosts.length > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                {translations.showing} {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} {translations.of} {filteredPosts.length} {translations.posts}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {translations.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {translations.next}
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Posts;
