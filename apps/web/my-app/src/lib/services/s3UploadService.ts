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
 * Upload an image to S3 using a pre-signed URL (Direct-to-S3 upload)
 */
export async function uploadImageToS3(file: File): Promise<S3UploadResponse> {
  try {
    // Step 1: Request a pre-signed URL from the server
    const presignRes = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileType: file.type })
    });
    if (!presignRes.ok) {
      const errorText = await presignRes.text();
      throw new Error(`Failed to get pre-signed URL: ${presignRes.status} - ${errorText}`);
    }
    const { url, key } = await presignRes.json();
    if (!url || !key) {
      throw new Error('Pre-signed URL or key missing from response');
    }

    // Step 2: Upload the file directly to S3
    const uploadRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file
    });
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`S3 upload failed: ${uploadRes.status} - ${errorText}`);
    }

    // Step 3: Construct the S3 file URL
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

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