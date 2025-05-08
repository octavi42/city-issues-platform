import React from 'react';
import Issue from '@/components/pages/Issue';

// Use an async component to handle dynamic params
export default async function IssueDetailPage() {
  // The Issue component doesn't accept data props so we simply render it
  // The component will fetch its own data based on the URL params
  return <Issue isIntercepted={false} />
} 

