/**
 * API utility functions for communicating with the backend
 */

// API base URL - replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Interface for API error responses
 */
export interface ApiError {
  message: string;
  status: number;
}

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>,
  headers?: HeadersInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Includes cookies in the request
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'An error occurred with the API request',
        status: response.status,
      };
    }
    
    // Parse JSON response
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * GET request helper function
 */
export async function get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
  return apiRequest<T>(endpoint, 'GET', undefined, headers);
}

/**
 * POST request helper function
 */
export async function post<T>(endpoint: string, data: Record<string, unknown>, headers?: HeadersInit): Promise<T> {
  return apiRequest<T>(endpoint, 'POST', data, headers);
}

/**
 * PUT request helper function
 */
export async function put<T>(endpoint: string, data: Record<string, unknown>, headers?: HeadersInit): Promise<T> {
  return apiRequest<T>(endpoint, 'PUT', data, headers);
}

/**
 * DELETE request helper function
 */
export async function del<T>(endpoint: string, data?: Record<string, unknown>, headers?: HeadersInit): Promise<T> {
  return apiRequest<T>(endpoint, 'DELETE', data, headers);
} 