import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

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
    const { fileName, fileType } = await request.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 });
    }

    const fileExtension = fileName.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const key = `uploads/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate pre-signed URL' }, { status: 500 });
  }
} 