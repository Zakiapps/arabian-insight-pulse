
// Arabic text preprocessing utilities with enhanced normalization
export function preprocessArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/ى/g, 'ي') // Normalize alif maksura
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Validate Arabic text using the enhanced validation
export function validateArabicText(text: string): boolean {
  const validation = validateArabicTextDetailed(text);
  return validation.isValid;
}

// Enhanced validation with detailed error messages
export function validateArabicTextDetailed(text: string): { isValid: boolean; errorMessage: string } {
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
