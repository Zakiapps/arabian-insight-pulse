
import { useState } from "react";
import { Upload as UploadIcon, FileText, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [singleText, setSingleText] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      setSelectedFile(null);
      event.target.value = '';
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const file = event.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
    
    if (file && !file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate file upload with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadStatus('success');
          toast.success("File uploaded successfully!");
          
          // Simulate API analysis time
          setTimeout(() => {
            toast.success("CSV analysis complete! 250 posts processed.");
          }, 2000);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 300);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  const handleTextAnalysis = () => {
    if (!singleText.trim()) {
      toast.error("Please enter some Arabic text to analyze");
      return;
    }
    
    toast.info("Analyzing text...");
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Analysis complete!");
      // In a real app, you would display results or redirect to results page
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload social media posts for AI sentiment and dialect analysis
        </p>
      </div>

      <Tabs defaultValue="batch" className="w-full">
        <TabsList>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          <TabsTrigger value="single">Single Post Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file containing Arabic social media posts for batch analysis.
                <br />
                The CSV should have a "content" column with the Arabic text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadStatus === 'success' ? (
                <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Upload Successful</AlertTitle>
                  <AlertDescription>
                    Your file has been uploaded and is being processed. You will be notified when the analysis is complete.
                  </AlertDescription>
                </Alert>
              ) : uploadStatus === 'error' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription>
                    There was an error uploading your file. Please try again.
                  </AlertDescription>
                </Alert>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  <Input 
                    id="csv-upload"
                    type="file" 
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Click or drag file to upload</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a CSV file with your social media posts<br />
                    File should be under 10MB
                  </p>
                </div>
              )}

              {selectedFile && uploadStatus !== 'success' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{uploadProgress}% complete</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {selectedFile && uploadStatus !== 'success' && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleFileUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload & Analyze"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Single Post</CardTitle>
              <CardDescription>
                Enter Arabic text to analyze sentiment and dialect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="post-content" className="text-sm font-medium">
                    Post Content
                  </label>
                  <textarea
                    id="post-content"
                    rows={5}
                    placeholder="Enter Arabic text..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={singleText}
                    onChange={(e) => setSingleText(e.target.value)}
                    dir="rtl"
                  ></textarea>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleTextAnalysis}>
                Analyze Text
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
          <CardDescription>
            Tips for preparing your data for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <h3 className="text-base font-semibold">CSV File Format</h3>
              <p className="text-sm text-muted-foreground">
                Your CSV file should have the following columns:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                <li>content: The Arabic text content (required)</li>
                <li>date: Post date in YYYY-MM-DD format (optional)</li>
                <li>platform: Social media platform source (optional)</li>
                <li>engagement: Number representing engagement count (optional)</li>
              </ul>
            </div>
            
            <div className="grid gap-2">
              <h3 className="text-base font-semibold">Example Format</h3>
              <div className="bg-muted/50 p-3 rounded-md overflow-x-auto">
                <code className="text-xs">
                  content,date,platform,engagement<br />
                  "الحكومة تعلن عن تخفيض أسعار المحروقات",2023-06-01,Twitter,145<br />
                  "زيادة الإقبال على المراكز التجارية خلال العطلة",2023-06-02,Facebook,278
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
