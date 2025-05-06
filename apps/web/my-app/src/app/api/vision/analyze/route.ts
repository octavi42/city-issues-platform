import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'https://167.71.34.169';

/**
 * Proxy API to forward requests to Vision API (bypassing mobile connectivity issues)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const formData = await request.formData();
    
    // Ensure the API URL has the proper format (no double slashes)
    const apiUrl = VISION_API_URL.endsWith('/') 
      ? `${VISION_API_URL}analyze` 
      : `${VISION_API_URL}/analyze`;
    
    console.log('Proxying request to:', apiUrl);
    
    // Forward the request to the Vision API
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      // Don't include credentials when proxying from server side
      // Don't specify CORS mode on server side
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in Vision API proxy:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the request', error: String(error) },
      { status: 500 }
    );
  }
} 