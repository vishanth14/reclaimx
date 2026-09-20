#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { ReclaimXStack } from "../lib/reclaimx-stack"

const app = new cdk.App()

// Deploy to ap-south-1 (Mumbai) as per requirement
new ReclaimXStack(app, "ReclaimXStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
    region: "ap-south-1",
  },
  description: "ReclaimX AI-Assisted Campus Lost & Found Infrastructure (Cognito, DynamoDB, S3, Lambda, API Gateway)",
})
