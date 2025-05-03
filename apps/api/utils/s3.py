"""
Utilities for Amazon S3 interactions.
"""
import os
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None
    class ClientError(Exception):
        pass

from .env_loader import load_dotenv

def get_s3_client():
    """
    Initialize and return an S3 client using credentials from environment variables.
    """
    if boto3 is None:
        raise ImportError(
            "boto3 library is required for S3 operations. Please install it via 'pip install boto3'."
        )
    load_dotenv()
    aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    region_name = os.getenv('AWS_REGION')
    session = boto3.session.Session(
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=region_name
    )
    return session.client('s3')

def upload_file_to_s3(file_path: str, bucket: str, object_name: str = None) -> str:
    """
    Upload a local file to an S3 bucket.

    :param file_path: Path to the local file.
    :param bucket: S3 bucket name.
    :param object_name: S3 object name. Defaults to the file's basename.
    :return: Public URL of the uploaded object.
    """
    if object_name is None:
        object_name = Path(file_path).name
    s3_client = get_s3_client()
    try:
        # Upload file and set public-read ACL for public access
        s3_client.upload_file(
            str(file_path),
            bucket,
            object_name,
            ExtraArgs={ 'ACL': 'public-read' }
        )
    except ClientError as e:
        raise RuntimeError(
            f"Failed to upload {file_path} to s3://{bucket}/{object_name}: {e}"
        )
    region = os.getenv('AWS_REGION')
    return f"https://{bucket}.s3.{region}.amazonaws.com/{object_name}"

def generate_presigned_url(bucket: str, object_name: str, expiration: int = 3600) -> str:
    """
    Generate a presigned URL to download an S3 object.

    :param bucket: S3 bucket name.
    :param object_name: S3 object key.
    :param expiration: Time in seconds for the presigned URL to remain valid.
    :return: Presigned URL as string.
    """
    s3_client = get_s3_client()
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': object_name},
            ExpiresIn=expiration
        )
    except ClientError as e:
        raise RuntimeError(
            f"Failed to generate presigned URL for s3://{bucket}/{object_name}: {e}"
        )
    return url