
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export const useNewsDeletion = () => {
  const [deletingArticles, setDeletingArticles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const deleteArticle = async (articleId: string, refetch: () => Promise<any>) => {
    setDeletingArticles(prev => ({ ...prev, [articleId]: true }));

    try {
      const { error } = await supabase
        .from('scraped_news')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      await refetch();

      toast({
        title: isRTL ? "تم الحذف" : "Deleted Successfully",
        description: isRTL ? "تم حذف المقال" : "Article deleted",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: isRTL ? "خطأ في الحذف" : "Delete Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setDeletingArticles(prev => ({ ...prev, [articleId]: false }));
    }
  };

  return {
    deletingArticles,
    deleteArticle
  };
};
