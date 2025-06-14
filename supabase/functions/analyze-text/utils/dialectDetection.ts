// Enhanced Jordanian dialect detection
export function detectJordanianDialect(text: string): string {
  const jordanianTerms = [
    "زلمة", "يا زلمة", "خرفنة", "تسليك", "احشش", "انكب", "راعي", "هسا", "شو", "كيفك",
    "إربد", "عمان", "الزرقاء", "العقبة", "منتخب", "واللهي", "عال", "بدك", "مش عارف",
    "تمام", "فش", "عالسريع", "يا رجال", "يلا", "خلص", "دبس", "بسطة",
    "جاي", "روح", "حياتي", "عن جد", "بكفي", "ما بدي", "طيب", "قديش", "وينك",
    "عالطول", "شايف", "هسه", "بتعرف", "بس", "يعني", "كتير", "شوي", "حبتين",
    "منيح", "بدأيش", "بطل", "خبرني", "ولك", "يا عمي", "مفكر", "بفكر"
  ];

  const jordanianPatterns = [
    /\b(شو|كيف|وين|بدك|مش|هسا|هسه|منيح)\b/gi,
    /\b(يا\s*(زلمة|رجال|حياتي|عمي))\b/gi,
    /\b(عال|فش|كتير|شوي)\b/gi,
    /\b(بدأيش|بطل|خبرني)\b/gi
  ];

  const textLower = text.toLowerCase();
  let score = 0;
  let totalChecks = jordanianTerms.length + jordanianPatterns.length;

  // Check for Jordanian terms
  jordanianTerms.forEach(term => {
    if (textLower.includes(term.toLowerCase())) {
      score += 1;
    }
  });

  // Check for Jordanian patterns
  jordanianPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length;
    }
  });

  // Calculate confidence score (0-1)
  const confidence = score / Math.max(totalChecks, 1);
  
  // Determine if text is Jordanian dialect
  return confidence > 0.15 ? 'Jordanian' : 'Non-Jordanian';
}