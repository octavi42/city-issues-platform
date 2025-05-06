/**
 * Vision Service - Handles API calls for City-Vision-Inspector
 */

import { post } from '../api';

// API endpoints - using Next.js API routes to bypass CORS
const API_ENDPOINTS = {
  ANALYZE: '/api/vision/analyze',
  RELEVANCE: '/api/vision/relevance'
};

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

  console.log('Sending image to API proxy:', formData);
  
  try {
    const response = await fetch(API_ENDPOINTS.ANALYZE, {
      method: 'POST',
      body: formData,
    });
    
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
        url: API_ENDPOINTS.ANALYZE,
        method: 'POST',
        mode: 'cors',
        credentials: 'include'
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
  return post<RelevanceResponse>(API_ENDPOINTS.RELEVANCE, data);
} 