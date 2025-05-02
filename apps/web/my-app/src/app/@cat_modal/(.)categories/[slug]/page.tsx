"use client";

import CategorySheetWrapper from '@/components/sheets/Category';

// This page intercepts navigation to /categories/[slug]
// and displays the category in a modal/sheet
export default function InterceptedCategoryPage() {
  return <CategorySheetWrapper />;
} 