import React from 'react';
import Maintained from '@/components/pages/Maintained';

// Use an async component to handle dynamic params
export default async function MaintainedPage() {
  return <Maintained isIntercepted={false} />
}