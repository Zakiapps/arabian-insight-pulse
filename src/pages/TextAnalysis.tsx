
import PublicTextAnalyzer from '@/components/analysis/PublicTextAnalyzer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3 } from 'lucide-react';

const TextAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir="rtl">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-xl">Arab Insights</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline">
                العودة للرئيسية
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">جرب تحليل المشاعر مجاناً</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اختبر قوة نموذج AraBERT في تحليل المشاعر واكتشاف اللهجات العربية
          </p>
        </div>

        <PublicTextAnalyzer />

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-primary/10 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">أعجبك التحليل؟</h2>
          <p className="text-muted-foreground mb-6">
            انضم إلى منصة Arab Insights للحصول على المزيد من الميزات المتقدمة
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg">إنشاء حساب مجاني</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">عرض الخطط</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextAnalysis;
