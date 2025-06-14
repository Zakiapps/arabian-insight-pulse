import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useUpload } from '@/contexts/UploadContext';
import { useLanguage } from '@/contexts/LanguageContext';

const formSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters'),
  source: z.string().min(1, 'Source is required'),
  author: z.string().optional(),
  location: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TextUploader: React.FC = () => {
  const { currentProject } = useProject();
  const { uploadText, processUpload } = useUpload();
  const { isRTL } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      source: 'manual',
      author: '',
      location: '',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!currentProject) return;
    
    setIsUploading(true);
    
    try {
      // Prepare metadata
      const metadata: Record<string, any> = {};
      if (values.author) metadata.author = values.author;
      if (values.location) metadata.location = values.location;
      
      // Upload the text
      const uploadId = await uploadText(
        currentProject.id,
        values.text,
        values.source,
        metadata
      );
      
      if (uploadId) {
        // Process the upload
        setIsProcessing(true);
        await processUpload(uploadId);
        
        // Reset the form
        form.reset();
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  if (!currentProject) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              {isRTL 
                ? 'يرجى اختيار مشروع أولاً لتحميل النصوص' 
                : 'Please select a project first to upload texts'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isRTL ? 'تحميل نص للتحليل' : 'Upload Text for Analysis'}
        </CardTitle>
        <CardDescription>
          {isRTL 
            ? 'أدخل النص العربي لتحليل المشاعر واللهجة' 
            : 'Enter Arabic text to analyze sentiment and dialect'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isRTL ? 'النص' : 'Text'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={isRTL 
                        ? 'أدخل النص العربي هنا...' 
                        : 'Enter Arabic text here...'
                      }
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRTL ? 'المصدر' : 'Source'}
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر المصدر' : 'Select source'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">
                          {isRTL ? 'إدخال يدوي' : 'Manual Input'}
                        </SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="news">
                          {isRTL ? 'أخبار' : 'News'}
                        </SelectItem>
                        <SelectItem value="blog">
                          {isRTL ? 'مدونة' : 'Blog'}
                        </SelectItem>
                        <SelectItem value="other">
                          {isRTL ? 'آخر' : 'Other'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRTL ? 'الكاتب (اختياري)' : 'Author (Optional)'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={isRTL ? 'اسم الكاتب' : 'Author name'}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRTL ? 'الموقع (اختياري)' : 'Location (Optional)'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={isRTL ? 'الموقع الجغرافي' : 'Geographic location'}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUploading || isProcessing}
            >
              {isUploading || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading 
                    ? (isRTL ? 'جاري التحميل...' : 'Uploading...') 
                    : (isRTL ? 'جاري المعالجة...' : 'Processing...')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {isRTL ? 'تحميل وتحليل' : 'Upload & Analyze'}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isRTL 
            ? 'سيتم تحليل النص باستخدام نموذج AraBERT للمشاعر وكشف اللهجة الأردنية' 
            : 'Text will be analyzed using AraBERT for sentiment and Jordanian dialect detection'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default TextUploader;