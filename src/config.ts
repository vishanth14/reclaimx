/**
 * Application-level configuration.
 * Values are resolved from Vite env vars at build time.
 */
export const APP_CONFIG = {
  /** Which backend adapter to use. 'local' = localStorage, 'aws' = API Gateway */
  backend: (import.meta.env.VITE_BACKEND ?? "local") as "local" | "aws",

  /** Base URL for the AWS API Gateway (only used when backend = 'aws') */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "") as string,

  /** AWS Cognito User Pool ID (only used when backend = 'aws') */
  cognitoUserPoolId: (import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "") as string,

  /** AWS Cognito App Client ID (only used when backend = 'aws') */
  cognitoClientId: (import.meta.env.VITE_COGNITO_CLIENT_ID ?? "") as string,

  /** AWS region (only used when backend = 'aws') */
  awsRegion: (import.meta.env.VITE_AWS_REGION ?? "ap-south-1") as string,

  /** S3/CloudFront base URL for images (only used when backend = 'aws') */
  imageBaseUrl: (import.meta.env.VITE_IMAGE_BASE_URL ?? "") as string,
} as const
