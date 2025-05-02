"use client";

import Issue from '@/components/pages/Issue';
import { useParams } from 'next/navigation';
import { Sheet } from "@silk-hq/components";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IssueSheetWrapper from '@/components/sheets/Issues';

// This page intercepts navigation to /categories/[slug]/[issue]
// and displays the issue in a modal/sheet
export default function InterceptedIssuePage() {
  const params = useParams();
  const router = useRouter();
  const [presented, setPresented] = useState(false);
  
  // Auto-present sheet on mount
  useEffect(() => {
    const timer = setTimeout(() => setPresented(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle closing: set state and navigate back
  function handlePresentedChange(isPresented: boolean) {
    setPresented(isPresented);
    if (!isPresented) {
      // Delay navigation to allow closing animation
      setTimeout(() => {
        router.back();
      }, 300); 
    }
  }

  // Create dummy data for the component
  const dummyData = {
    id: params.issue,
    category: params.slug,
    title: `Issue ${params.issue} in ${params.slug}`,
    description: 'This is dummy content for the issue.',
  };

  return <IssueSheetWrapper />
} 