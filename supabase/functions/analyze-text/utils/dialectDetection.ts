
// Enhanced Jordanian dialect detection using comprehensive terms and patterns
export function detectJordanianDialect(text: string): string {
  // قائمة موسعة بالمفردات والتعابير الأردنية
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "مطربين الأردن", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال الأمن", "يلا", "خلص", "دبس", "بسطة",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين"
  ];

  // تحليل الأنماط اللغوية الأردنية
  const jordanianPatterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه)\b/gi,  // كلمات أردنية شائعة
    /\b(يا\s*(زلمة|رجال|حياتي))\b/gi  // تعابير مثل "يا زلمة"
  ];

  const textLower = text.toLowerCase();
  
  // التحقق من وجود المصطلحات الأردنية
  const hasTerms = jordanianTerms.some(term => textLower.includes(term.toLowerCase()));
  
  // التحقق من وجود الأنماط الأردنية
  const hasPatterns = jordanianPatterns.some(pattern => pattern.test(text));
  
  return (hasTerms || hasPatterns) ? 'Jordanian' : 'Non-Jordanian';
}

// دالة للتحقق من جودة النص العربي
export function validateArabicText(text: string): { isValid: boolean; errorMessage: string } {
  if (!text || text.trim().length < 3) {
    return { isValid: false, errorMessage: 'النص فارغ أو قصير جدًا' };
  }
  
  // التحقق من وجود حروف عربية
  const hasArabicChars = /[\u0600-\u06FF]/.test(text);
  if (!hasArabicChars) {
    return { isValid: false, errorMessage: 'النص لا يحتوي على حروف عربية' };
  }
  
  return { isValid: true, errorMessage: '' };
}
