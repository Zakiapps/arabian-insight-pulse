
import React from 'react';
import { TextAnalyzer } from "@/components/analysis/TextAnalyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageCircle } from "lucide-react";

const TextAnalysis = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl" dir="rtl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">تحليل المشاعر للنصوص العربية</h1>
          <p className="text-muted-foreground text-lg">
            استخدم نموذج AraBERT المتقدم لتحليل مشاعر النصوص العربية وتصنيفها
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                نموذج AraBERT
              </CardTitle>
              <CardDescription>
                نموذج ذكي مدرب خصيصاً لفهم وتحليل النصوص العربية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• تحليل دقيق للمشاعر الإيجابية والسلبية</li>
                <li>• مُحسّن خصيصاً للهجات العربية المختلفة</li>
                <li>• معالجة سريعة وفورية للنصوص</li>
                <li>• نتائج موثوقة مع درجة ثقة عالية</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                كيفية الاستخدام
              </CardTitle>
              <CardDescription>
                خطوات بسيطة للحصول على تحليل دقيق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                <li>1. اكتب أو الصق النص العربي في المربع أدناه</li>
                <li>2. اضغط على زر "تحليل النص"</li>
                <li>3. احصل على النتيجة فوراً مع درجة الثقة</li>
                <li>4. راجع التفاصيل الإضافية للتحليل</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto">
          <TextAnalyzer 
            title="محلل المشاعر"
            placeholder="اكتب هنا النص العربي الذي تريد تحليل مشاعره... يمكن أن يكون تعليق، مراجعة، أو أي نص آخر"
          />
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>أمثلة للتجربة</CardTitle>
            <CardDescription>جرب هذه النصوص لترى كيف يعمل النموذج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">مثال إيجابي:</div>
                <div className="text-sm text-green-700">
                  "هذا المنتج رائع جداً وأنصح الجميع بشرائه. جودة ممتازة وخدمة عملاء مميزة."
                </div>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-800 mb-1">مثال سلبي:</div>
                <div className="text-sm text-red-700">
                  "تجربة سيئة جداً مع هذه الخدمة. لا أنصح أحد بالتعامل معهم."
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-800 mb-1">مثال محايد:</div>
                <div className="text-sm text-gray-700">
                  "تم تسليم الطلب في الوقت المحدد. المنتج كما هو موضح في الوصف."
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextAnalysis;
