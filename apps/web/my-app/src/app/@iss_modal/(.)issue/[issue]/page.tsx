"use client";

import { useParams } from 'next/navigation';
import IssueSheetWrapper from '@/components/sheets/Issues';

// This page intercepts navigation to /categories/[slug]/[issue]
// and displays the issue in a modal/sheet
export default function InterceptedIssuePage() {
  // We still capture params for debugging but don't use them directly
  // as IssueSheetWrapper handles its own routing and sheet presentation
  useParams();
  
  return <IssueSheetWrapper />;
} 