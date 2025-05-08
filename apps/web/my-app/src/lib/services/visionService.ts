/**
 * Vision Service - Handles API calls for City-Vision-Inspector
 */

// Base URL for Vision API - can be overridden with env var
const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://0.0.0.0:8000';

// API endpoints
const ENDPOINTS = {
  ANALYZE: '/analyze',
  RELEVANCE: '/relevance'
};

// Type definitions
export interface AnalysisRequest {
  image?: File; // Now optional since we'll prioritize imageUrl
  user_id: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  imageUrl: string; // S3 image URL is now required
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

export interface EnhancedError {
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
 * Submit an image for analysis using its S3 URL
 * This makes a direct request to the Vision API without going through the Next.js API routes
 */
export async function analyzeImage(data: AnalysisRequest): Promise<AnalysisResponse> {
  const formData = new FormData();
  
  // Only use the image URL, never send the file
  // Try multiple parameter names to maximize compatibility
  formData.append('image_url', data.imageUrl);
  formData.append('imageUrl', data.imageUrl);
  formData.append('url', data.imageUrl);
  console.log('Using image URL:', data.imageUrl);
  
  formData.append('user_id', data.user_id);
  formData.append('location', JSON.stringify(data.location));

  console.log('Making direct request to Vision API with image URL');
  
  // Ensure no double slashes in URL
  const apiUrl = VISION_API_URL.endsWith('/') 
    ? `${VISION_API_URL}${ENDPOINTS.ANALYZE.substring(1)}` 
    : `${VISION_API_URL}${ENDPOINTS.ANALYZE}`;
  
  console.log('Request URL:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      mode: 'cors',
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
        url: apiUrl,
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
 * Submit relevance feedback directly to the Vision API
 */
export async function submitRelevanceFeedback(data: RelevanceRequest): Promise<RelevanceResponse> {
  // Ensure no double slashes in URL
  const apiUrl = VISION_API_URL.endsWith('/') 
    ? `${VISION_API_URL}${ENDPOINTS.RELEVANCE.substring(1)}` 
    : `${VISION_API_URL}${ENDPOINTS.RELEVANCE}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in submitRelevanceFeedback:', error);
    throw error;
  }
} 