
// Enhanced Jordanian dialect detection
export function detectJordanianDialect(text: string): string {
  const jordanianWords = ['زلمة', 'هسا', 'شو', 'بدك', 'يلا', 'تمام', 'خلاص', 'مش', 'هيك', 'بموت', 'فيك'];
  let matchCount = 0;
  
  for (const word of jordanianWords) {
    if (text.includes(word)) matchCount++;
    if (matchCount >= 2) break; // Early exit
  }
  
  return matchCount >= 2 ? 'Jordanian' : 'Non-Jordanian';
}
