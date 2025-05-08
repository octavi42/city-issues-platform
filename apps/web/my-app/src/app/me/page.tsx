import React from 'react';
import Account from '@/components/pages/Account';

// Use an async component to handle dynamic params
export default async function MePage() {
  // The Issue component doesn't accept data props so we simply render it
  // The component will fetch its own data based on the URL params
  return <Account isIntercepted={false} />
}