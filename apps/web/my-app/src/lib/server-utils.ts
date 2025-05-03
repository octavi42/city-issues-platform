// This file should only be imported in server-side code
export function getServerEnv() {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    return {
      NEO4J_URI: process.env.NEO4J_URI,
      NEO4J_USERNAME: process.env.NEO4J_USERNAME,
      NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    };
  }
  
  throw new Error('This function should only be called from server-side code');
} 