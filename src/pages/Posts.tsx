
import { useState } from "react";
import { Filter, Search, ChevronDown, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

// Mock data for posts
const samplePosts = [
  {
    id: "p1",
    content: "الحكومة تعلن عن إجراءات جديدة لدعم الاقتصاد المحلي",
    platform: "Twitter",
    sentiment: "positive",
    dialect: "Jordanian",
    date: "2023-06-10",
    engagement: 245
  },
  {
    id: "p2",
    content: "أسعار المحروقات ترتفع مجدداً والمواطنون يعبرون عن استيائهم",
    platform: "Facebook",
    sentiment: "negative",
    dialect: "Jordanian",
    date: "2023-06-09",
    engagement: 513
  },
  {
    id: "p3",
    content: "افتتاح معرض للمنتجات المحلية في العاصمة عمان",
    platform: "Twitter",
    sentiment: "positive",
    dialect: "Jordanian",
    date: "2023-06-08",
    engagement: 189
  },
  {
    id: "p4",
    content: "وزارة التربية تعلن عن نتائج التوجيهي خلال الأسبوع القادم",
    platform: "Facebook",
    sentiment: "neutral",
    dialect: "Jordanian",
    date: "2023-06-08",
    engagement: 782
  },
  {
    id: "p5",
    content: "خبراء الاقتصاد يتوقعون تحسن في أداء السوق المالي",
    platform: "Twitter",
    sentiment: "positive",
    dialect: "Non-Jordanian",
    date: "2023-06-07",
    engagement: 122
  },
  {
    id: "p6",
    content: "مطالبات بتحسين الخدمات الصحية في المناطق النائية",
    platform: "Facebook",
    sentiment: "negative",
    dialect: "Jordanian",
    date: "2023-06-07",
    engagement: 345
  },
  {
    id: "p7",
    content: "إطلاق مبادرة لدعم المشاريع الصغيرة والمتوسطة",
    platform: "Twitter",
    sentiment: "positive",
    dialect: "Non-Jordanian",
    date: "2023-06-06",
    engagement: 267
  },
  {
    id: "p8",
    content: "نقابة المعلمين تعلن عن سلسلة مطالب جديدة",
    platform: "Facebook",
    sentiment: "neutral",
    dialect: "Jordanian",
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

const DialogectBadge = ({ dialect }: { dialect: string }) => {
  const variants: Record<string, string> = {
    Jordanian: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
    "Non-Jordanian": "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  };

  return (
    <Badge className={cn(variants[dialect])}>
      {dialect}
    </Badge>
  );
};

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [dialectFilter, setDialectFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Apply filters
  const filteredPosts = samplePosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || post.sentiment === sentimentFilter;
    const matchesDialect = dialectFilter === 'all' || post.dialect === dialectFilter;
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    return matchesSearch && matchesSentiment && matchesDialect && matchesPlatform;
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
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Search and filter monitored Arabic social media posts
          </p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4 mr-1" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Post Search & Filtering</CardTitle>
          <CardDescription>
            Narrow down results by text, sentiment, dialect, or platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sentiment</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={dialectFilter} onValueChange={setDialectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Dialect" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Dialect</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Jordanian">Jordanian</SelectItem>
                  <SelectItem value="Non-Jordanian">Non-Jordanian</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Platform</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
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
                  <TableHead className="w-[400px]">Content</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Dialect</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Engagement</TableHead>
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
                      <DialogectBadge dialect={post.dialect} />
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
              <h3 className="text-lg font-semibold">No posts found</h3>
              <p className="text-muted-foreground text-center mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
        {filteredPosts.length > 0 && (
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
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
