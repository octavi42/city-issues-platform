import { NextRequest, NextResponse } from 'next/server';

const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL || 'https://api.cristeaz.com';

/**
 * Proxy API to forward relevance feedback requests to Vision API (bypassing CORS)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const data = await request.json();
    
    // Log the API URL being used
    console.log('Using Vision API URL for relevance:', VISION_API_URL);
    
    // Forward the request to the Vision API
    const response = await fetch(`${VISION_API_URL}/relevance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Log response status
    console.log('Proxy API relevance response status:', response.status);
    
    // Get the response data
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      const text = await response.text();
      console.log('Non-JSON response from relevance endpoint:', text);
      responseData = { message: text };
    }
    
    // Return the response
    return NextResponse.json(responseData, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in Vision API relevance proxy:', error);
    return NextResponse.json(
      { 
        message: 'An error occurred while processing the relevance feedback',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 