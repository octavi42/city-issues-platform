 'use client';

 import { useState, useEffect } from 'react';

 /**
  * Describes a user location and how it was determined.
  */
 export interface UserLocation {
   latitude: number;
   longitude: number;
   method: 'geolocation' | 'ip';
 }

 /**
  * useUserLocation
  *
  * Attempts to get precise location via the browser Geolocation API (with high accuracy).
  * If the user denies permission or the API is unavailable/times out, falls back to an IP-based lookup.
  * Returns null until a location has been determined.
  */
 export function useUserLocation(): UserLocation | null {
   const [location, setLocation] = useState<UserLocation | null>(null);

   useEffect(() => {
     const fetchIpLocation = () => {
       fetch('https://ipapi.co/json/')
         .then(res => res.json())
         .then(data => {
           const lat = parseFloat(data.latitude);
           const lon = parseFloat(data.longitude);
           if (!isNaN(lat) && !isNaN(lon)) {
             setLocation({ latitude: lat, longitude: lon, method: 'ip' });
           }
         })
         .catch(err => console.error('IP geolocation error', err));
     };

     // Attempt browser geolocation first
     if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
       navigator.geolocation.getCurrentPosition(
         pos => {
           setLocation({
             latitude: pos.coords.latitude,
             longitude: pos.coords.longitude,
             method: 'geolocation',
           });
         },
         err => {
           console.warn('Geolocation error, falling back to IP:', err);
           fetchIpLocation();
         },
         { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
       );
     } else {
       // Geolocation unsupported, fallback immediately
       fetchIpLocation();
     }
   }, []);

   return location;
 }