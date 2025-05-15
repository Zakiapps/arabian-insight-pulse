
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to get text direction based on language
export function getTextDirection(language: string): "rtl" | "ltr" {
  return language === 'ar' ? "rtl" : "ltr"
}

// Categories for topic classification
export const categories = [
  { id: "politics", nameAr: "السياسة", nameEn: "Politics", color: "bg-blue-500" },
  { id: "economy", nameAr: "الاقتصاد", nameEn: "Economy", color: "bg-green-500" },
  { id: "sports", nameAr: "الرياضة", nameEn: "Sports", color: "bg-orange-500" },
  { id: "technology", nameAr: "التكنولوجيا", nameEn: "Technology", color: "bg-purple-500" },
  { id: "health", nameAr: "الصحة", nameEn: "Health", color: "bg-red-500" },
  { id: "education", nameAr: "التعليم", nameEn: "Education", color: "bg-yellow-500" },
  { id: "society", nameAr: "المجتمع", nameEn: "Society", color: "bg-indigo-500" }
]

// Helper to get category by ID
export function getCategoryById(id: string, language: string = 'ar') {
  const category = categories.find(cat => cat.id === id)
  return category ? (language === 'ar' ? category.nameAr : category.nameEn) : id
}

// Helper to get category color by ID
export function getCategoryColor(id: string) {
  const category = categories.find(cat => cat.id === id)
  return category ? category.color : "bg-gray-500"
}
