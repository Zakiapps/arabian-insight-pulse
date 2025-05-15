
import { useState } from "react";
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

// Mock report templates
const reportTemplates = [
  {
    id: "1",
    name: "Sentiment Analysis Report",
    description: "Overview of sentiment trends and analysis",
    icon: "chart",
  },
  {
    id: "2",
    name: "Dialect Distribution Report",
    description: "Analysis of dialect distribution across posts",
    icon: "globe",
  },
  {
    id: "3",
    name: "Engagement Metrics Report",
    description: "Engagement statistics and trends",
    icon: "activity",
  },
  {
    id: "4",
    name: "Topic Analysis Report",
    description: "Breakdown of the most discussed topics",
    icon: "list",
  },
];

// Mock generated reports
const generatedReports = [
  {
    id: "r1",
    name: "Weekly Sentiment Analysis",
    date: "2023-06-10",
    format: "PDF",
  },
  {
    id: "r2",
    name: "Monthly Dialect Report",
    date: "2023-06-01",
    format: "Excel",
  },
  {
    id: "r3",
    name: "Q2 Engagement Summary",
    date: "2023-05-15",
    format: "PDF",
  },
];

const Reports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState(reportTemplates[0]);
  
  const handleGenerateReport = () => {
    if (!date) {
      toast.error("Please select a date range");
      return;
    }

    toast.info("Generating report...");
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success("Report generated successfully!");
    }, 1500);
  };

  const handleDownloadReport = (reportId: string) => {
    toast.info("Downloading report...");
    
    // Simulate download delay
    setTimeout(() => {
      toast.success("Report downloaded successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports from your data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>
              Create a new report with your selected parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">Report Template</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedTemplate.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
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
                <div className="font-medium text-sm">Date Range</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
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
                <div className="font-medium text-sm">Report Format</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      PDF
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>PDF</DropdownMenuItem>
                    <DropdownMenuItem>Excel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleGenerateReport}
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Previous Reports</CardTitle>
            <CardDescription>
              Access your generated reports
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
                      <div className="ml-3">
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
                  <h3 className="mt-2 text-sm font-semibold">No reports yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate your first report to see it here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>
            Available report types and their contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Sentiment Analysis Report</h3>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                <li>Sentiment distribution (positive, neutral, negative)</li>
                <li>Sentiment trends over selected time period</li>
                <li>Top positive and negative keywords</li>
                <li>Sentiment by topic breakdown</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Dialect Distribution Report</h3>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                <li>Jordanian vs non-Jordanian dialect distribution</li>
                <li>Dialect usage by topic</li>
                <li>Dialect trends over selected time period</li>
                <li>Geographic distribution when available</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Engagement Metrics Report</h3>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                <li>Engagement by platform (likes, shares, comments)</li>
                <li>Engagement correlation with sentiment</li>
                <li>Top engaging content analysis</li>
                <li>Engagement trends over selected time period</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Topic Analysis Report</h3>
              <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                <li>Top topics by volume</li>
                <li>Topic sentiment breakdown</li>
                <li>Emerging topics identification</li>
                <li>Topic correlation analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
