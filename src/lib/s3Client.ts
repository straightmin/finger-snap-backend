import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
});

export const bucketName = process.env.AWS_S3_BUCKET_NAME!;

export default s3Client;
