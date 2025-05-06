"use client";

import ImageSheetWrapper from '@/components/sheets/Image';

// This page intercepts navigation to /categories/[slug]
// and displays the category in a modal/sheet
export default function InterceptedCategoryPage() {
  return <ImageSheetWrapper />
} 