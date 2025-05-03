#!/usr/bin/env python3
"""
Script to test uploading a file to AWS S3.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from utils.env_loader import load_dotenv
from utils.s3 import upload_file_to_s3, generate_presigned_url

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {Path(sys.argv[0]).name} <file_path> [object_name]")
        sys.exit(1)
    file_path = sys.argv[1]
    object_name = sys.argv[2] if len(sys.argv) > 2 else None

    load_dotenv()
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        print("Error: AWS_S3_BUCKET environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    try:
        url = upload_file_to_s3(file_path, bucket, object_name)
        print(f"Uploaded to {url}")
    except Exception as e:
        print(f"Failed to upload: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        key = object_name or Path(file_path).name
        presigned = generate_presigned_url(bucket, key)
        print(f"Presigned URL (expires in default seconds): {presigned}")
    except Exception:
        pass

if __name__ == "__main__":
    main()