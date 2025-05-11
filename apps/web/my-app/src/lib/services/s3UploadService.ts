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
 * Upload an image to S3 using a presigned URL
 */
export async function uploadImageToS3(file: File): Promise<S3UploadResponse> {
  try {
    // Step 1: Get a presigned URL from the API
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop();
    const presignRes = await fetch('/api/upload/s3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileType, fileExtension }),
    });
    if (!presignRes.ok) {
      const errorText = await presignRes.text();
      throw new Error(`Failed to get S3 presigned URL: ${presignRes.status} - ${errorText}`);
    }
    const { uploadUrl, fileUrl, key } = await presignRes.json();
    if (!uploadUrl || !fileUrl) {
      throw new Error('Presigned URL response missing uploadUrl or fileUrl');
    }

    // Step 2: Upload the file directly to S3
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
        'x-amz-acl': 'public-read',
      },
      body: file,
    });
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`S3 upload failed: ${uploadRes.status} - ${errorText}`);
    }

    return {
      success: true,
      url: fileUrl,
      key: key
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during S3 upload'
    };
  }
} 