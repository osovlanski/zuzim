const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    'מסעדה', 'אוכל', 'קפה', 'פיצה', 'שווארמה', 'בורגר', 'סושי', 'מקדונלד',
    'restaurant', 'cafe', 'coffee', 'pizza', 'food', 'eat', 'burger', 'sushi',
    'רמי לוי', 'שופרסל', 'מגה', 'ויקטורי', 'יינות ביתן', 'AM:PM', 'ten',
    'starbucks', 'cofix', 'aroma', 'ארומה', 'קופיקס', 'גוטה',
  ],
  Transport: [
    'דלק', 'דור אלון', 'פז', 'סונול', 'אלון', 'גז', 'fuel', 'petrol', 'gas station',
    'תחבורה', 'רכבת', 'אוטובוס', 'מונית', 'taxi', 'uber', 'gett', 'bolt',
    'חניה', 'parking', 'נהיגה', 'רכב', 'גולדן', 'kal', 'רב קו', 'ravkav',
  ],
  Shopping: [
    'אמזון', 'amazon', 'aliexpress', 'ebay', 'זארה', 'zara', 'H&M', 'HM',
    'IKEA', 'איקאה', 'home center', 'הום סנטר', 'כאן', 'ACE', 'ace',
    'bug', 'bugs', 'KSP', 'ksp', 'ivory', 'אייבורי',
  ],
  Health: [
    'בית מרקחת', 'pharmacy', 'super-pharm', 'superpharm', 'כללית', 'מכבי',
    'leumit', 'לאומית', 'רופא', 'doctor', 'קליניקה', 'clinic', 'hospital',
    'בית חולים', 'ביטוח', 'insurance', 'optika', 'אופטיקה', 'בית חולים',
  ],
  Entertainment: [
    'סרט', 'קולנוע', 'cinema', 'movie', 'yes', 'hot', 'netflix', 'spotify',
    'apple', 'google play', 'disney', 'amazon prime', 'גיימינג', 'gaming',
    'steam', 'playstation', 'xbox', 'nintendo', 'gym', 'sport', 'ספורט',
    'מופע', 'show', 'concert', 'theatre', 'theater',
  ],
  Utilities: [
    'חשמל', 'מים', 'גז', 'ארנונה', 'electricity', 'water', 'gas', 'internet',
    'bezeq', 'בזק', 'cellcom', 'סלקום', 'partner', 'פרטנר', 'hot mobile',
    'golan telecom', 'גולן', '012', 'ברקת', 'rishum', 'municipality',
    'עיריה', 'va\'ad', 'ועד',
  ],
};

export type Category = 'Food' | 'Transport' | 'Shopping' | 'Health' | 'Entertainment' | 'Utilities' | 'Income' | 'Other';

export function categorize(description: string): Category {
  const normalizedDescription = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedDescription.includes(keyword.toLowerCase())) {
        return category as Category;
      }
    }
  }

  return 'Other';
}
