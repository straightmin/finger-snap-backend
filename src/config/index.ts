// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'PORT',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Error: Missing required environment variable: ${envVar}`);
    }
}

const config = {
    JWT_SECRET: process.env.JWT_SECRET!,
    DATABASE_URL: process.env.DATABASE_URL!,
    AWS_REGION: process.env.AWS_REGION!,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME!,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    PORT: parseInt(process.env.PORT!, 10),
};

export default config;
