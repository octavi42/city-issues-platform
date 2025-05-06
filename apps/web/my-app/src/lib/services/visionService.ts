/**
 * Vision Service - Handles API calls for City-Vision-Inspector
 */

import { post } from '../api';

// Base URL for Vision API - can be overridden with env var
const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000';

// API endpoints - direct API endpoints
const DIRECT_ENDPOINTS = {
  ANALYZE: '/analyze',
  RELEVANCE: '/relevance'
};

// Local proxy API endpoints - use these to avoid mobile connectivity issues
const PROXY_ENDPOINTS = {
  ANALYZE: '/api/vision/analyze',
  RELEVANCE: '/api/vision/relevance'
};

// Detect if we're running on mobile
const isMobileDevice = typeof window !== 'undefined' && 
  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// Type definitions
export interface AnalysisRequest {
  image: File;
  user_id: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
}

export interface AnalysisResponse {
  [key: string]: unknown;
}

export interface RelevanceRequest extends Record<string, unknown> {
  photo_id: string;
  user_id: string;
  additional_info: string;
}

export interface RelevanceResponse {
  delta_score: number;
}

// Define error response types
interface ErrorResponse {
  message?: string;
  status?: number;
  statusText?: string;
  rawResponse?: string;
  parseError?: boolean;
  [key: string]: unknown;
}

interface EnhancedError {
  message: string;
  type: 'network' | 'abort' | 'unknown';
  cors?: boolean;
  requestDetails: {
    url: string;
    method: string;
    mode: string;
    credentials: string;
  };
  originalError: unknown;
  [key: string]: unknown;
}

/**
 * Submit an image for analysis
 */
export async function analyzeImage(data: AnalysisRequest): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('image', data.image);
  formData.append('user_id', data.user_id);
  formData.append('location', JSON.stringify(data.location));

  // Use proxy API endpoint on mobile to avoid connectivity issues
  // and direct API for desktop browsers
  let apiUrl: string;
  
  if (isMobileDevice) {
    console.log('Using proxy API endpoint for mobile device');
    apiUrl = PROXY_ENDPOINTS.ANALYZE;
  } else {
    // Direct API call with proper URL formatting
    apiUrl = VISION_API_URL.endsWith('/') 
      ? `${VISION_API_URL}${DIRECT_ENDPOINTS.ANALYZE.substring(1)}` 
      : `${VISION_API_URL}${DIRECT_ENDPOINTS.ANALYZE}`;
  }
  
  console.log('Sending image to API:', apiUrl);
  
  try {
    const fetchOptions: RequestInit = {
      method: 'POST',
      body: formData,
    };
    
    // Only add CORS mode and credentials for direct API calls
    if (!isMobileDevice) {
      fetchOptions.mode = 'cors';
      fetchOptions.credentials = 'include';
    }
    
    const response = await fetch(apiUrl, fetchOptions);
    
    if (!response.ok) {
      let errorData: ErrorResponse = {};
      
      try {
        // Try to parse error response as JSON
        errorData = await response.json();
      } catch (parseError) {
        console.warn('Error parsing error response as JSON:', parseError);
        // If JSON parsing failed, get text content instead
        try {
          const textContent = await response.text();
          errorData = { 
            rawResponse: textContent,
            parseError: true
          };
        } catch (textError) {
          console.warn('Error getting text content from response:', textError);
          errorData = { 
            message: 'Could not parse error response',
            status: response.status,
            statusText: response.statusText
          };
        }
      }
      
      console.error('Error response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        errorData
      });
      
      throw {
        message: errorData.message || `API error: ${response.status} ${response.statusText}`,
        status: response.status,
        details: errorData,
        rawHeaders: Object.fromEntries([...response.headers.entries()])
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error in analyzeImage:', error);
    
    // Create a more detailed error object
    const enhancedError: EnhancedError = {
      message: '',
      type: 'unknown',
      originalError: error,
      requestDetails: {
        url: apiUrl,
        method: 'POST',
        mode: isMobileDevice ? 'no-cors' : 'cors',
        credentials: isMobileDevice ? 'same-origin' : 'include'
      }
    };
    
    if (error instanceof TypeError) {
      enhancedError.message = `Network error: ${error.message}`;
      enhancedError.type = 'network';
      enhancedError.cors = error.message.includes('CORS') || error.message.includes('cross-origin');
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      enhancedError.message = 'Request was aborted';
      enhancedError.type = 'abort';
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      enhancedError.message = typeof errorObj.message === 'string' 
        ? errorObj.message 
        : 'Unknown error occurred';
      
      // Copy over properties from the original error
      Object.entries(errorObj).forEach(([key, value]) => {
        enhancedError[key] = value;
      });
    } else {
      enhancedError.message = String(error);
    }
    
    throw enhancedError;
  }
}

/**
 * Submit relevance feedback
 */
export async function submitRelevanceFeedback(data: RelevanceRequest): Promise<RelevanceResponse> {
  // For consistency, also use the proxy endpoint for relevance feedback on mobile
  let apiUrl: string;
  
  if (isMobileDevice) {
    console.log('Using proxy API endpoint for mobile device');
    // If we have a proxy endpoint for relevance, use it
    apiUrl = PROXY_ENDPOINTS.RELEVANCE;
    return post<RelevanceResponse>(apiUrl, data);
  } else {
    // Direct API call with proper URL formatting
    apiUrl = VISION_API_URL.endsWith('/') 
      ? `${VISION_API_URL}${DIRECT_ENDPOINTS.RELEVANCE.substring(1)}` 
      : `${VISION_API_URL}${DIRECT_ENDPOINTS.RELEVANCE}`;
    return post<RelevanceResponse>(apiUrl, data);
  }
} 