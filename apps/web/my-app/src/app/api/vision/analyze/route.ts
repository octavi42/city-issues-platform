import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'https://api.cristeaz.com';

/**
 * Proxy API to forward requests to Vision API (bypassing CORS)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const formData = await request.formData();
    
    // Log the API URL being used
    console.log('Using Vision API URL:', VISION_API_URL);
    
    // Forward the request to the Vision API
    const response = await fetch(`${VISION_API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    // Log response status
    console.log('Proxy API response status:', response.status);
    
    // Get the response data
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      try {
        // Try to parse anyway in case content-type header is wrong
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }
    
    // Return the response
    return NextResponse.json(responseData, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in Vision API proxy:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred while processing the request',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 