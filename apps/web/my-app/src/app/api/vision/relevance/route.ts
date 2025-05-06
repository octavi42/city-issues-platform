import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'https://167.71.34.169';

/**
 * Proxy API to forward relevance feedback requests to Vision API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const data = await request.json();
    
    // Ensure the API URL has the proper format (no double slashes)
    const apiUrl = VISION_API_URL.endsWith('/') 
      ? `${VISION_API_URL}relevance` 
      : `${VISION_API_URL}/relevance`;
    
    console.log('Proxying relevance feedback to:', apiUrl);
    
    // Forward the request to the Vision API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Get the response data
    const responseData = await response.json();
    
    // Return the response
    return NextResponse.json(responseData, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in Vision API relevance proxy:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the relevance feedback', error: String(error) },
      { status: 500 }
    );
  }
} 