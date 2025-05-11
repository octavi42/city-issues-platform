import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Get S3 configuration from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  try {
    // Check if configuration is available
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
      console.error('S3 configuration missing. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME');
      return NextResponse.json(
        { success: false, error: 'S3 configuration missing' },
        { status: 500 }
      );
    }

    // Parse JSON body
    const { fileType, fileExtension } = await request.json();
    if (!fileType) {
      return NextResponse.json(
        { success: false, error: 'Missing fileType in request body' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const ext = fileExtension || fileType.split('/').pop();
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const key = `uploads/${uniqueFilename}`;

    // Create a presigned URL for PUT
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    });
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      key,
      uploadUrl: presignedUrl,
      fileUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Error generating S3 presigned URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
} 