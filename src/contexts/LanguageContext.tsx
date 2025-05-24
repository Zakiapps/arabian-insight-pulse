
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  isRTL: boolean;
  t: (text: string) => string;
  language: string;
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  // Dashboard translations
  'Dashboard': 'لوحة التحكم',
  'Monitor and analyze sentiments, dialects and topics in Arabic social media': 'مراقبة وتحليل المشاعر واللهجات والمواضيع في وسائل التواصل الاجتماعي العربية',
  'Filter': 'تصفية',
  'Export': 'تصدير',
  'Export as PDF': 'تصدير كملف PDF',
  'Export as Excel': 'تصدير كملف Excel',
  'All': 'الكل',
  'Total Analyzed Posts': 'إجمالي المنشورات المحللة',
  'Positive Sentiment': 'المشاعر الإيجابية',
  'Neutral Sentiment': 'المشاعر المحايدة',
  'Negative Sentiment': 'المشاعر السلبية',
  'from last week': 'من الأسبوع الماضي',
  'posts': 'منشور',
  'Platform Distribution': 'توزيع المنصات',
  'Posts by social media platform': 'المنشورات حسب منصة التواصل الاجتماعي',
  'View All': 'عرض الكل',
  'Dialect Detection': 'كشف اللهجة',
  'Distribution of Jordanian vs non-Jordanian dialects': 'توزيع اللهجات الأردنية مقابل غير الأردنية',
  
  // Admin panel translations
  'Users': 'المستخدمين',
  'Settings': 'الإعدادات',
  'Logout': 'تسجيل الخروج',
  'Search': 'بحث',
  'Notifications': 'الإشعارات',
  'Profile': 'الملف الشخصي',
  'Help': 'المساعدة',
  'Admin': 'مدير',
  
  // Upload page
  'Data Upload': 'تحميل البيانات',
  'Upload social media posts for AI sentiment and dialect analysis': 'تحميل منشورات وسائل التواصل الاجتماعي لتحليل المشاعر واللهجات بالذكاء الاصطناعي',
  'Batch Upload': 'تحميل مجموعة',
  'Single Post Analysis': 'تحليل منشور واحد',
  'Upload CSV File': 'تحميل ملف CSV',
  'Upload a CSV file containing Arabic social media posts for batch analysis.': 'قم بتحميل ملف CSV يحتوي على منشورات وسائل التواصل الاجتماعي العربية للتحليل المجمّع.',
  'The CSV should have a "content" column with the Arabic text.': 'يجب أن يحتوي ملف CSV على عمود "content" يتضمن النص العربي.',
  'Upload Successful': 'تم التحميل بنجاح',
  'Your file has been uploaded and is being processed. You will be notified when the analysis is complete.': 'تم تحميل ملفك وجاري معالجته. سيتم إشعارك عند اكتمال التحليل.',
  'Upload Failed': 'فشل التحميل',
  'There was an error uploading your file. Please try again.': 'حدث خطأ أثناء تحميل ملفك. يرجى المحاولة مرة أخرى.',
  'Click or drag file to upload': 'انقر أو اسحب الملف للتحميل',
  'Upload a CSV file with your social media posts': 'قم بتحميل ملف CSV يحتوي على منشورات وسائل التواصل الاجتماعي الخاصة بك',
  'File should be under 10MB': 'يجب أن يكون حجم الملف أقل من 10 ميجابايت',
  'Cancel': 'إلغاء',
  'Upload & Analyze': 'تحميل وتحليل',
  'Analyze Single Post': 'تحليل منشور واحد',
  'Enter Arabic text to analyze sentiment and dialect': 'أدخل نصًا عربيًا لتحليل المشاعر واللهجة',
  'Post Content': 'محتوى المنشور',
  'Enter Arabic text...': 'أدخل النص العربي...',
  'Analyze Text': 'تحليل النص',
  'Upload Guidelines': 'إرشادات التحميل',
  'Tips for preparing your data for analysis': 'نصائح لتحضير بياناتك للتحليل',
  'CSV File Format': 'تنسيق ملف CSV',
  'Your CSV file should have the following columns:': 'يجب أن يحتوي ملف CSV الخاص بك على الأعمدة التالية:',
  'content: The Arabic text content (required)': 'content: محتوى النص العربي (مطلوب)',
  'date: Post date in YYYY-MM-DD format (optional)': 'date: تاريخ المنشور بتنسيق YYYY-MM-DD (اختياري)',
  'platform: Social media platform source (optional)': 'platform: منصة وسائل التواصل الاجتماعي (اختياري)',
  'engagement: Number representing engagement count (optional)': 'engagement: رقم يمثل عدد التفاعلات (اختياري)',
  'Example Format': 'مثال على التنسيق',
  
  // Alerts page
  'Alerts': 'التنبيهات',
  'Get notified when important metrics change': 'احصل على إشعارات عندما تتغير المقاييس المهمة',
  'New Alert': 'تنبيه جديد',
  'Create Alert': 'إنشاء تنبيه',
  'Set up parameters for your new alert': 'إعداد معلمات للتنبيه الجديد',
  'Alert Name': 'اسم التنبيه',
  'Enter alert name': 'أدخل اسم التنبيه',
  'Alert Type': 'نوع التنبيه',
  'Select metric': 'اختر المقياس',
  'Metrics': 'المقاييس',
  'Sentiment': 'المشاعر',
  'Engagement': 'التفاعل',
  'Dialect': 'اللهجة',
  'Condition': 'الشرط',
  'Select condition': 'اختر الشرط',
  'Above': 'أعلى من',
  'Below': 'أقل من',
  'Equals': 'يساوي',
  'Threshold Value': 'قيمة العتبة',
  'Timeframe': 'الإطار الزمني',
  'Select timeframe': 'اختر الإطار الزمني',
  'Last Hour': 'الساعة الأخيرة',
  'Last 24 Hours': 'آخر 24 ساعة',
  'Last Week': 'الأسبوع الماضي',
  'Keyword (Optional)': 'الكلمة المفتاحية (اختياري)',
  'Filter by keyword': 'تصفية حسب الكلمة المفتاحية',
  'Enable alert immediately': 'تفعيل التنبيه فورًا',
  'Save Alert': 'حفظ التنبيه',
  'No Alerts Set Up': 'لم يتم إعداد تنبيهات',
  'You haven\'t created any alerts yet. Create your first alert to get notified about important changes.': 'لم تقم بإنشاء أي تنبيهات بعد. قم بإنشاء أول تنبيه للحصول على إشعارات حول التغييرات المهمة.',
  'Create First Alert': 'إنشاء أول تنبيه',
  'Alert Types': 'أنواع التنبيهات',
  'Different types of alerts you can set up': 'أنواع مختلفة من التنبيهات التي يمكنك إعدادها',
  'Sentiment Alerts': 'تنبيهات المشاعر',
  'Get notified when sentiment thresholds are triggered': 'احصل على إشعار عند تجاوز عتبات المشاعر',
  'Engagement Alerts': 'تنبيهات التفاعل',
  'Monitor when engagement levels spike or drop for your topics of interest': 'مراقبة متى ترتفع أو تنخفض مستويات التفاعل للمواضيع التي تهمك',
  'Dialect Alerts': 'تنبيهات اللهجة',
  'Get notified about posts in specific dialects for targeted monitoring': 'احصل على إشعارات حول المنشورات بلهجات محددة للمراقبة المستهدفة',
  'Test Alert': 'اختبار التنبيه',
  
  // Reports page
  'Reports': 'التقارير',
  'Generate and download reports from your data': 'إنشاء وتنزيل تقارير من بياناتك',
  'Generate New Report': 'إنشاء تقرير جديد',
  'Create a new report with your selected parameters': 'إنشاء تقرير جديد بالمعلمات المحددة',
  'Report Template': 'قالب التقرير',
  'Date Range': 'النطاق الزمني',
  'Select date': 'اختر التاريخ',
  'Report Format': 'تنسيق التقرير',
  'Generate Report': 'إنشاء التقرير',
  'Previous Reports': 'التقارير السابقة',
  'Access your generated reports': 'الوصول إلى التقارير التي تم إنشاؤها',
  'No reports yet': 'لا توجد تقارير بعد',
  'Generate your first report to see it here': 'قم بإنشاء أول تقرير لعرضه هنا',
  'Report Types': 'أنواع التقارير',
  'Available report types and their contents': 'أنواع التقارير المتاحة ومحتوياتها',
  'Sentiment Analysis Report': 'تقرير تحليل المشاعر',
  'Dialect Distribution Report': 'تقرير توزيع اللهجات',
  'Engagement Metrics Report': 'تقرير مقاييس التفاعل',
  'Topic Analysis Report': 'تقرير تحليل المواضيع',
  'Weekly Sentiment Analysis': 'تحليل المشاعر الأسبوعي',
  'Monthly Dialect Report': 'تقرير اللهجات الشهري',
  'Q2 Engagement Summary': 'ملخص التفاعل للربع الثاني',
  
  // Settings page
  'Account': 'الحساب',
  'API': 'واجهة برمجة التطبيقات',
  'Update your personal information and password': 'تحديث المعلومات الشخصية وكلمة المرور',
  'Name': 'الاسم',
  'Email': 'البريد الإلكتروني',
  'Company (Optional)': 'الشركة (اختياري)',
  'Change Password': 'تغيير كلمة المرور',
  'Current password': 'كلمة المرور الحالية',
  'New password': 'كلمة المرور الجديدة',
  'Must be at least 8 characters': 'يجب أن تكون على الأقل 8 أحرف',
  'Confirm new password': 'تأكيد كلمة المرور الجديدة',
  'Save changes': 'حفظ التغييرات',
  'API Settings': 'إعدادات واجهة برمجة التطبيقات',
  'Manage your API keys and webhooks': 'إدارة مفاتيح API والويب هوك',
  'API Key': 'مفتاح API',
  'No API key generated': 'لم يتم إنشاء مفتاح API',
  'Generate': 'إنشاء',
  'Use this key to access the ArabInsights API': 'استخدم هذا المفتاح للوصول إلى واجهة برمجة تطبيقات ArabInsights',
  'Access Level': 'مستوى الوصول',
  'Select access level': 'اختر مستوى الوصول',
  'Read Only': 'قراءة فقط',
  'Read & Write': 'قراءة وكتابة',
  'Control the level of access for this API key': 'التحكم في مستوى الوصول لمفتاح API هذا',
  'Webhook URL (Optional)': 'عنوان URL للويب هوك (اختياري)',
  'We\'ll send alert notifications to this URL': 'سنرسل إشعارات التنبيه إلى عنوان URL هذا',
  'Save API settings': 'حفظ إعدادات API',
  'Notification Preferences': 'تفضيلات الإشعارات',
  'Choose how and when you receive notifications': 'اختر كيفية ووقت تلقي الإشعارات',
  'Delivery Methods': 'طرق التوصيل',
  'Email Notifications': 'إشعارات البريد الإلكتروني',
  'Receive notifications via email': 'تلقي الإشعارات عبر البريد الإلكتروني',
  'App Notifications': 'إشعارات التطبيق',
  'Receive notifications in the dashboard': 'تلقي الإشعارات في لوحة التحكم',
  'Notify when sentiment thresholds are triggered': 'الإشعار عند تجاوز عتبات المشاعر',
  'Notify about dialect-specific triggers': 'الإشعار حول مشغلات اللهجة المحددة',
  'Report Generation': 'إنشاء التقارير',
  'Notify when reports are ready for viewing': 'الإشعار عندما تكون التقارير جاهزة للعرض',
  'Save notification preferences': 'حفظ تفضيلات الإشعارات'
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Initial setting is Arabic (RTL)
  const [isRTL, setIsRTL] = useState<boolean>(true);
  const [language, setLanguageState] = useState<string>('ar');
  
  // Update document direction when RTL state changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Toggle between RTL and LTR
  const toggleLanguage = () => {
    setIsRTL(prev => !prev);
    setLanguageState(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Set language directly
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setIsRTL(lang === 'ar');
  };

  // Simple translation helper 
  const t = (text: string): string => {
    if (language === 'en') return text;
    return translations[text as keyof typeof translations] || text;
  };

  return (
    <LanguageContext.Provider value={{ isRTL, t, language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
