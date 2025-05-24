
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Papa from 'papaparse';

const EnhancedUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { startTask, completeTask } = useTaskHistory();
  const { createNotification } = useNotifications();
  const { profile } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    const taskId = await startTask('upload', `رفع ملف: ${file.name}`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            setUploadProgress(30);
            
            // Prepare data for analysis
            const posts = results.data.map((row: any, index: number) => ({
              id: `upload_${Date.now()}_${index}`,
              user_id: profile.id,
              content: row.content || row.text || row.message || '',
              source: row.source || row.platform || 'upload',
              created_at: new Date().toISOString(),
              analyzed_at: new Date().toISOString()
            })).filter(post => post.content && post.content.length > 0);

            setUploadProgress(60);

            // Analyze posts using Supabase function
            const analysisPromises = posts.map(async (post) => {
              const { data, error } = await supabase.functions.invoke('analyze-text', {
                body: { text: post.content }
              });

              if (error) throw error;

              return {
                ...post,
                sentiment: data.sentiment,
                sentiment_score: data.confidence,
                is_jordanian_dialect: data.is_jordanian,
                engagement_count: Math.floor(Math.random() * 100) // Random for demo
              };
            });

            const analyzedPosts = await Promise.all(analysisPromises);
            setUploadProgress(80);

            // Save to database
            const { error: insertError } = await supabase
              .from('analyzed_posts')
              .insert(analyzedPosts);

            if (insertError) throw insertError;

            setUploadProgress(100);

            await completeTask(taskId, {
              postsCount: analyzedPosts.length,
              fileName: file.name
            });

            await createNotification(
              'تم رفع البيانات بنجاح',
              `تم تحليل ${analyzedPosts.length} منشور من ملف ${file.name}`,
              'success'
            );

          } catch (error) {
            console.error('Analysis error:', error);
            await completeTask(taskId, null, error.message);
            await createNotification(
              'خطأ في التحليل',
              `فشل في تحليل ملف ${file.name}`,
              'error'
            );
          }
        },
        error: async (error) => {
          await completeTask(taskId, null, error.message);
          await createNotification(
            'خطأ في قراءة الملف',
            `فشل في قراءة ملف ${file.name}`,
            'error'
          );
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      await completeTask(taskId, null, error.message);
      await createNotification(
        'خطأ في الرفع',
        `فشل في رفع ملف ${file.name}`,
        'error'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          رفع وتحليل البيانات
        </CardTitle>
        <CardDescription>
          قم برفع ملف CSV يحتوي على البيانات النصية لتحليلها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">اختر ملف CSV للرفع</p>
            <p className="text-sm text-muted-foreground">
              يجب أن يحتوي الملف على عمود 'content' أو 'text' أو 'message'
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button 
              className="mt-4" 
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    جاري الرفع... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    اختيار ملف
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>

        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>يدعم ملفات CSV</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>تحليل تلقائي للمشاعر</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>كشف اللهجة الأردنية</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedUpload;
