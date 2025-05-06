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
    
    // Check if we're using an image URL or direct file upload
    const imageUrl = formData.get('image_url') as string | null;
    
    // Create a new FormData to send to the backend API
    const apiFormData = new FormData();
    
    // If we have an image URL, we need to pass it with the correct parameter name
    // that the backend API expects. Let's check the documentation and use the right name.
    if (imageUrl) {
      console.log('Using pre-uploaded image URL:', imageUrl);
      // Try these common parameter names for image URLs
      apiFormData.append('image_url', imageUrl);
      apiFormData.append('imageUrl', imageUrl);
      apiFormData.append('url', imageUrl);
      
      // Still include original image if present, as fallback
      const image = formData.get('image');
      if (image) {
        apiFormData.append('image', image);
      }
    } else {
      // Pass through all form data fields for direct file upload
      for (const [key, value] of formData.entries()) {
        apiFormData.append(key, value);
      }
    }
    
    // Pass through all other fields like user_id and location regardless
    for (const [key, value] of formData.entries()) {
      if (key !== 'image' && key !== 'image_url') {
        apiFormData.append(key, value);
      }
    }
    
    // Log what we're sending
    console.log('Sending to backend API:', 
      imageUrl 
        ? `Using image URL: ${imageUrl}` 
        : `Using file upload: ${formData.get('image') ? 'Image file present' : 'No image file'}`
    );
    
    // Forward the request to the Vision API
    const response = await fetch(`${VISION_API_URL}/analyze`, {
      method: 'POST',
      body: apiFormData,
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