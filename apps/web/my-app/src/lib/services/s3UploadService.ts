/**
 * S3 Upload Service - Handles image uploads to AWS S3
 */

// Define the response from the S3 upload API
interface S3UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload an image to S3 using a proxy API route
 */
export async function uploadImageToS3(file: File): Promise<S3UploadResponse> {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading image to S3:', file.name, file.type, `${file.size / 1024} KB`);
    
    // Send to our proxy upload endpoint
    const response = await fetch('/api/upload/s3', {
      method: 'POST',
      body: formData,
    });
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed: ${response.status} - ${errorText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    if (!data.url) {
      throw new Error('S3 upload successful but no URL was returned');
    }
    
    return {
      success: true,
      url: data.url,
      key: data.key
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during S3 upload'
    };
  }
} 