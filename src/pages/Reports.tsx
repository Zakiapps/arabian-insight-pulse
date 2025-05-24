
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Download, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Report template type
type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

// Report type
type Report = {
  id: string;
  name: string;
  date: string;
  format: string;
  file_url?: string;
  report_type: string;
};

// Report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "تقرير تحليل المشاعر",
    description: "نظرة عامة على اتجاهات وتحليلات المشاعر",
    icon: "chart",
  },
  {
    id: "2",
    name: "تقرير توزيع اللهجات",
    description: "تحليل توزيع اللهجات عبر المنشورات",
    icon: "globe",
  },
  {
    id: "3",
    name: "تقرير مقاييس التفاعل",
    description: "إحصائيات واتجاهات التفاعل",
    icon: "activity",
  },
  {
    id: "4",
    name: "تقرير تحليل المواضيع",
    description: "تفصيل المواضيع الأكثر نقاشاً",
    icon: "list",
  },
];

// Map from template ID to report type
const templateToReportType: Record<string, string> = {
  "1": "sentiment",
  "2": "dialect",
  "3": "engagement",
  "4": "topic"
};

const Reports = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState(reportTemplates[0]);
  const [selectedFormat, setSelectedFormat] = useState("PDF");
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user reports from Supabase
  useEffect(() => {
    async function fetchReports() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching reports:", error);
          toast.error("حدث خطأ أثناء جلب التقارير");
          return;
        }
        
        // Transform data to match our Report type
        const transformedReports: Report[] = data.map(report => ({
          id: report.id,
          name: report.name,
          date: format(new Date(report.created_at || new Date()), 'yyyy-MM-dd'),
          format: report.format,
          file_url: report.file_url || undefined,
          report_type: report.report_type
        }));
        
        setGeneratedReports(transformedReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        toast.error("فشل في تحميل التقارير");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReports();
  }, [user]);
  
  const handleGenerateReport = async () => {
    if (!date || !user) {
      toast.error("الرجاء اختيار نطاق زمني");
      return;
    }

    toast.info("جاري إنشاء التقرير...");
    
    try {
      // Create report parameters
      const reportType = templateToReportType[selectedTemplate.id];
      const reportName = selectedTemplate.name + " - " + format(date, 'yyyy-MM-dd');
      
      // Insert report into database
      const { data, error } = await supabase
        .from('user_reports')
        .insert({
          user_id: user.id,
          name: reportName,
          report_type: reportType,
          format: selectedFormat,
          parameters: { date: format(date, 'yyyy-MM-dd') },
          status: 'completed' // In a real app, this would be 'processing' initially
        })
        .select();
        
      if (error) {
        console.error("Error creating report:", error);
        toast.error("حدث خطأ أثناء إنشاء التقرير");
        return;
      }
      
      // Add new report to state
      const newReport: Report = {
        id: data[0].id,
        name: data[0].name,
        date: format(new Date(data[0].created_at), 'yyyy-MM-dd'),
        format: data[0].format,
        report_type: data[0].report_type
      };
      
      setGeneratedReports([newReport, ...generatedReports]);
      toast.success("تم إنشاء التقرير بنجاح!");
      
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("فشل في إنشاء التقرير");
    }
  };

  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would download the actual file from storage
    toast.info("جاري تنزيل التقرير...");
    
    // Simulate download delay
    setTimeout(() => {
      toast.success("تم تنزيل التقرير بنجاح!");
    }, 1000);
  };

  // Show loading state
  if (isLoading && !generatedReports.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('Reports')}</h1>
          <p className="text-muted-foreground">
            {t('Generate and download reports from your data')}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('Reports')}</h1>
        <p className="text-muted-foreground">
          {t('Generate and download reports from your data')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('Generate New Report')}</CardTitle>
            <CardDescription>
              {t('Create a new report with your selected parameters')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">{t('Report Template')}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTemplate.name}
                      <ChevronDown className="h-4 w-4 mr-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[320px]">
                    {reportTemplates.map(template => (
                      <DropdownMenuItem 
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex flex-col">
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {template.description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">{t('Date Range')}</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-right">
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {date ? format(date, "PPP") : t('Select date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm">{t('Report Format')}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedFormat}
                      <ChevronDown className="h-4 w-4 mr-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedFormat("PDF")}>PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFormat("Excel")}>Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleGenerateReport}
              >
                {t('Generate Report')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('Previous Reports')}</CardTitle>
            <CardDescription>
              {t('Access your generated reports')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReports.length > 0 ? (
                generatedReports.map(report => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="mr-3">
                        <div className="font-medium text-sm">{report.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(report.date), "PPP")} • {report.format}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center rounded-full p-2 bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">{t('No reports yet')}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('Generate your first report to see it here')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('Report Types')}</CardTitle>
          <CardDescription>
            {t('Available report types and their contents')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">{t('Sentiment Analysis Report')}</h3>
              <ul className="text-sm text-muted-foreground list-disc mr-5 space-y-1">
                <li>توزيع المشاعر (إيجابية، محايدة، سلبية)</li>
                <li>اتجاهات المشاعر خلال الفترة الزمنية المحددة</li>
                <li>أهم الكلمات الإيجابية والسلبية</li>
                <li>تقسيم المشاعر حسب الموضوع</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('Dialect Distribution Report')}</h3>
              <ul className="text-sm text-muted-foreground list-disc mr-5 space-y-1">
                <li>توزيع اللهجات الأردنية مقابل غير الأردنية</li>
                <li>استخدام اللهجات حسب الموضوع</li>
                <li>اتجاهات اللهجات خلال الفترة الزمنية المحددة</li>
                <li>التوزيع الجغرافي عندما يكون متاحًا</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('Engagement Metrics Report')}</h3>
              <ul className="text-sm text-muted-foreground list-disc mr-5 space-y-1">
                <li>التفاعل حسب المنصة (الإعجابات، المشاركات، التعليقات)</li>
                <li>علاقة التفاعل بالمشاعر</li>
                <li>تحليل المحتوى الأكثر تفاعلاً</li>
                <li>اتجاهات التفاعل خلال الفترة الزمنية المحددة</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('Topic Analysis Report')}</h3>
              <ul className="text-sm text-muted-foreground list-disc mr-5 space-y-1">
                <li>أهم المواضيع من حيث الحجم</li>
                <li>تقسيم مشاعر المواضيع</li>
                <li>تحديد المواضيع الناشئة</li>
                <li>تحليل العلاقة بين المواضيع</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
