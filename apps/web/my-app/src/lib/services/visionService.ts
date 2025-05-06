/**
 * Vision Service - Handles API calls for City-Vision-Inspector
 */

import { post } from '../api';

// Base URL for Vision API - can be overridden with env var
const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'http://localhost:8000';

// API endpoints
const ENDPOINTS = {
  ANALYZE: '/analyze',
  RELEVANCE: '/relevance'
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

/**
 * Submit an image for analysis
 */
export async function analyzeImage(data: AnalysisRequest): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('image', data.image);
  formData.append('user_id', data.user_id);
  formData.append('location', JSON.stringify(data.location));

  console.log('Sending image to Vision API:', formData);
  
  const response = await fetch(`${VISION_API_URL}${ENDPOINTS.ANALYZE}`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error response:', errorData);
    throw {
      message: errorData.message || 'An error occurred while analyzing the image',
      status: response.status,
    };
  }
  
  return await response.json();
}

/**
 * Submit relevance feedback
 */
export async function submitRelevanceFeedback(data: RelevanceRequest): Promise<RelevanceResponse> {
  return post<RelevanceResponse>(`${VISION_API_URL}${ENDPOINTS.RELEVANCE}`, data);
} 