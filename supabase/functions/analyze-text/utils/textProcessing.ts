
// Arabic text preprocessing utilities
export function preprocessArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ة/g, 'ه') // Normalize taa marbouta
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Validate Arabic text
export function validateArabicText(text: string): boolean {
  return text && text.length >= 3 && /[\u0600-\u06FF]/.test(text);
}
