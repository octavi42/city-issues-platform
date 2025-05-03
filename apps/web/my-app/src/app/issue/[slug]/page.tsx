import React from 'react';
import IssueDetail from '@/components/IssueDetail';
import { ExampleSheetWithStacking } from '@/components/examples/SheetWithStacking/ExampleSheetWithStacking';
import Issue from '@/components/pages/Issue';
import IssueSheetWrapper from '@/components/sheets/Issues';

// Define the expected shape of the params object
interface PageProps {
  params: {
    slug: string;
    issue: string;
  };
}

// Use the PageProps interface for the component props
// Make the component async to properly handle dynamic params
export default async function IssueDetailPage({ params }: PageProps) {
  // Params are now properly awaited when accessed in an async component
  const { slug, issue } = params;

  // Create dummy data for the 'data' prop
  const dummyData = {
    id: issue,
    category: slug,
    title: `Issue ${issue} in ${slug}`,
    description: 'This is dummy content for the issue.',
    // Add other fields expected by ExampleSheetWithStackingProps if known
  };

  return <Issue data={dummyData} />
} 

