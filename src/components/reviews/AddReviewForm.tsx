
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StarRating } from './StarRating';

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  company: z.string().min(2, "اسم الشركة/المؤسسة يجب أن يكون أكثر من حرفين"),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, "الرأي يجب أن يكون 10 أحرف على الأقل"),
});

const AddReviewForm = ({ onReviewAdded }: { onReviewAdded: () => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.profile?.full_name || '',
      company: '',
      rating: 5,
      review: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Store review in analyzed_posts table with positive sentiment
      const { error } = await supabase
        .from('analyzed_posts')
        .insert({
          content: values.review,
          source: values.company,
          user_id: user?.id || '', 
          sentiment: 'positive',
          sentiment_score: values.rating / 5, // Convert 1-5 rating to 0-1 score
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('تم إضافة رأيك بنجاح، شكراً لمشاركتك!');
      setOpen(false);
      form.reset();
      onReviewAdded();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ أثناء إرسال رأيك، الرجاء المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">أضف رأيك</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>شاركنا رأيك</DialogTitle>
          <DialogDescription>
            أخبرنا عن تجربتك مع منصة رؤى عربية
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="الاسم الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشركة / المؤسسة</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الشركة أو المؤسسة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التقييم</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onRatingChange={field.onChange}
                      editable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رأيك</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب رأيك هنا..." 
                      className="h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewForm;
