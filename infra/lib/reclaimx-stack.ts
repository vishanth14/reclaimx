import * as path from "path"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import * as cognito from "aws-cdk-lib/aws-cognito"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"

export class ReclaimXStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Amazon Cognito User Pool & App Client
    // ─────────────────────────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, "ReclaimXUserPool", {
      userPoolName: "reclaimx-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: false },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
        fullname: { required: false, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
        studentId: new cognito.StringAttribute({ mutable: true }),
        department: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const userPoolClient = new cognito.UserPoolClient(this, "ReclaimXWebClient", {
      userPool,
      userPoolClientName: "reclaimx-web-spa-client",
      generateSecret: false, // SPA / browser client must NOT have client secret
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      idTokenValidity: cdk.Duration.days(1),
      accessTokenValidity: cdk.Duration.days(1),
      refreshTokenValidity: cdk.Duration.days(30),
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Amazon DynamoDB Tables (Billing: PAY_PER_REQUEST / On-Demand)
    // ─────────────────────────────────────────────────────────────────────────

    // Items Table (Lost and Found items)
    const itemsTable = new dynamodb.Table(this, "ReclaimXItemsTable", {
      tableName: "reclaimx-items",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    itemsTable.addGlobalSecondaryIndex({
      indexName: "byTypeStatus",
      partitionKey: { name: "type", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    itemsTable.addGlobalSecondaryIndex({
      indexName: "byUser",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    itemsTable.addGlobalSecondaryIndex({
      indexName: "byCategory",
      partitionKey: { name: "category", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // Proof Lockers Table (STRICT SERVER-SIDE ISOLATION)
    // Contains private expected answers and clue details
    const proofLockersTable = new dynamodb.Table(this, "ReclaimXProofLockersTable", {
      tableName: "reclaimx-proof-lockers",
      partitionKey: { name: "itemId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Claims Table
    const claimsTable = new dynamodb.Table(this, "ReclaimXClaimsTable", {
      tableName: "reclaimx-claims",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    claimsTable.addGlobalSecondaryIndex({
      indexName: "byClaimant",
      partitionKey: { name: "claimantId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    claimsTable.addGlobalSecondaryIndex({
      indexName: "byFinder",
      partitionKey: { name: "finderId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    claimsTable.addGlobalSecondaryIndex({
      indexName: "byFoundItem",
      partitionKey: { name: "foundItemId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // Matches Table (Pre-computed and cached matches)
    const matchesTable = new dynamodb.Table(this, "ReclaimXMatchesTable", {
      tableName: "reclaimx-matches",
      partitionKey: { name: "lostItemId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "foundItemId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    matchesTable.addGlobalSecondaryIndex({
      indexName: "byScore",
      partitionKey: { name: "lostItemId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "score", type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Amazon S3 Bucket for Media Assets
    // ─────────────────────────────────────────────────────────────────────────
    const mediaBucket = new s3.Bucket(this, "ReclaimXMediaBucket", {
      bucketName: cdk.PhysicalName.GENERATE_IF_NEEDED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 4. AWS Lambda Functions
    // ─────────────────────────────────────────────────────────────────────────
    const backendPath = path.join(__dirname, "../../backend")

    const lambdaEnv = {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      ITEMS_TABLE: itemsTable.tableName,
      PROOF_LOCKERS_TABLE: proofLockersTable.tableName,
      CLAIMS_TABLE: claimsTable.tableName,
      MATCHES_TABLE: matchesTable.tableName,
      MEDIA_BUCKET: mediaBucket.bucketName,
    }

    const itemsLambda = new lambda.Function(this, "ItemsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/items/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    itemsTable.grantReadWriteData(itemsLambda)
    proofLockersTable.grantReadWriteData(itemsLambda)

    const claimsLambda = new lambda.Function(this, "ClaimsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/claims/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    claimsTable.grantReadWriteData(claimsLambda)
    itemsTable.grantReadData(claimsLambda)

    const verificationLambda = new lambda.Function(this, "VerificationHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/verification/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    proofLockersTable.grantReadData(verificationLambda)
    claimsTable.grantReadWriteData(verificationLambda)

    const handoverLambda = new lambda.Function(this, "HandoverHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/handover/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    claimsTable.grantReadWriteData(handoverLambda)
    itemsTable.grantReadWriteData(handoverLambda)

    const matchingLambda = new lambda.Function(this, "MatchingHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/matching/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    itemsTable.grantReadData(matchingLambda)
    matchesTable.grantReadWriteData(matchingLambda)

    const uploadLambda = new lambda.Function(this, "UploadHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdas/upload/index.handler",
      code: lambda.Code.fromAsset(backendPath),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })
    mediaBucket.grantRead(uploadLambda)
    mediaBucket.grantPut(uploadLambda)

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Amazon API Gateway REST API & Cognito Authorizer
    // ─────────────────────────────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, "ReclaimXApi", {
      restApiName: "ReclaimX API",
      description: "ReclaimX REST API for campus lost and found operations",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
      deployOptions: {
        stageName: "prod",
        throttlingRateLimit: 50,
        throttlingBurstLimit: 100,
      },
    })

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuth", {
      cognitoUserPools: [userPool],
      authorizerName: "CognitoAuthorizer",
    })

    const authMethodOptions: apigateway.MethodOptions = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    }

    // ── /items resource tree
    const itemsRes = api.root.addResource("items")
    itemsRes.addMethod("GET", new apigateway.LambdaIntegration(itemsLambda)) // Public list & filter
    const singleItemRes = itemsRes.addResource("{id}")
    singleItemRes.addMethod("GET", new apigateway.LambdaIntegration(itemsLambda)) // Public item detail
    const itemStatusRes = singleItemRes.addResource("status")
    itemStatusRes.addMethod("PATCH", new apigateway.LambdaIntegration(itemsLambda), authMethodOptions)

    const lostItemRes = itemsRes.addResource("lost")
    lostItemRes.addMethod("POST", new apigateway.LambdaIntegration(itemsLambda), authMethodOptions)

    const foundItemRes = itemsRes.addResource("found")
    foundItemRes.addMethod("POST", new apigateway.LambdaIntegration(itemsLambda), authMethodOptions)

    // ── /claims resource tree
    const claimsRes = api.root.addResource("claims")
    claimsRes.addMethod("GET", new apigateway.LambdaIntegration(claimsLambda), authMethodOptions)
    claimsRes.addMethod("POST", new apigateway.LambdaIntegration(claimsLambda), authMethodOptions)
    const singleClaimRes = claimsRes.addResource("{id}")
    singleClaimRes.addMethod("GET", new apigateway.LambdaIntegration(claimsLambda), authMethodOptions)
    singleClaimRes.addMethod("PATCH", new apigateway.LambdaIntegration(claimsLambda), authMethodOptions)

    // ── /verification resource tree
    const verificationRes = api.root.addResource("verification")
    const questionsRes = verificationRes.addResource("questions")
    const itemQuestionsRes = questionsRes.addResource("{itemId}")
    itemQuestionsRes.addMethod("GET", new apigateway.LambdaIntegration(verificationLambda)) // Public questions (expectedAnswer stripped)
    const evaluateRes = verificationRes.addResource("evaluate")
    evaluateRes.addMethod("POST", new apigateway.LambdaIntegration(verificationLambda), authMethodOptions)

    // ── /handover resource tree
    const handoverRes = api.root.addResource("handover")
    const claimHandoverRes = handoverRes.addResource("{claimId}")
    claimHandoverRes.addResource("confirm-finder").addMethod("POST", new apigateway.LambdaIntegration(handoverLambda), authMethodOptions)
    claimHandoverRes.addResource("confirm-owner").addMethod("POST", new apigateway.LambdaIntegration(handoverLambda), authMethodOptions)
    claimHandoverRes.addResource("complete").addMethod("POST", new apigateway.LambdaIntegration(handoverLambda), authMethodOptions)

    // ── /matching resource tree
    const matchingRes = api.root.addResource("matching")
    matchingRes.addResource("lost").addResource("{itemId}").addMethod("GET", new apigateway.LambdaIntegration(matchingLambda), authMethodOptions)
    matchingRes.addResource("found").addResource("{itemId}").addMethod("GET", new apigateway.LambdaIntegration(matchingLambda), authMethodOptions)
    matchingRes.addResource("score-pair").addMethod("POST", new apigateway.LambdaIntegration(matchingLambda), authMethodOptions)

    // ── /uploads resource tree
    const uploadsRes = api.root.addResource("uploads")
    uploadsRes.addResource("presigned-url").addMethod("POST", new apigateway.LambdaIntegration(uploadLambda), authMethodOptions)
    uploadsRes.addResource("download-url").addMethod("GET", new apigateway.LambdaIntegration(uploadLambda), authMethodOptions)

    // ─────────────────────────────────────────────────────────────────────────
    // 6. CloudFormation Outputs
    // ─────────────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
      description: "Cognito User Pool ID",
      exportName: "ReclaimX-UserPoolId",
    })

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client ID",
      exportName: "ReclaimX-UserPoolClientId",
    })

    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: api.url,
      description: "API Gateway Base URL (default endpoint)",
      exportName: "ReclaimX-ApiGatewayUrl",
    })

    new cdk.CfnOutput(this, "MediaBucketName", {
      value: mediaBucket.bucketName,
      description: "S3 Bucket for uploaded images",
      exportName: "ReclaimX-MediaBucketName",
    })

    new cdk.CfnOutput(this, "AwsRegion", {
      value: this.region,
      description: "Deployment Region",
      exportName: "ReclaimX-AwsRegion",
    })
  }
}
