 'use client';
 
 import { useState, useEffect } from 'react';
 import FingerprintJS from '@fingerprintjs/fingerprintjs';
 
 /**
  * useVisitorId
  *
  * Generates or retrieves a persistent visitor ID using FingerprintJS.
  * Caches the ID in localStorage to avoid re-fingerprinting on every load.
  */
 export function useVisitorId(): string | null {
   const [visitorId, setVisitorId] = useState<string | null>(null);

   useEffect(() => {
     const init = async () => {
       if (typeof window === 'undefined') return;
       try {
         // Check cache
         const stored = localStorage.getItem('visitorId');
         if (stored) {
           setVisitorId(stored);
           return;
         }
         // Generate new fingerprint
         const fp = await FingerprintJS.load();
         const result = await fp.get();
         localStorage.setItem('visitorId', result.visitorId);
         setVisitorId(result.visitorId);
       } catch (e) {
         console.error('useVisitorId error:', e);
       }
     };
     init();
   }, []);

   return visitorId;
 }