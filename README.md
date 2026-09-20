# 🔐 ReclaimX

### Privacy-preserving lost-and-found with proof-based ownership verification

<p align="center">
  <a href="https://github.com/vishanth14/reclaimx">
    📦 <strong>GitHub Repository</strong>
  </a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://main.dyiigltg5jsjm.amplifyapp.com">
    🚀 <strong>Live Demo</strong>
  </a>
</p>

<p align="center">
  Find lost items, discover potential matches, verify ownership privately, and complete a secure handover.
</p>

<p align="center">
  <strong>Find it. Prove it. Reclaim it.</strong>
</p>

---

## 🛠️ Tech Stack

**React** • **TypeScript** • **Vite** • **AWS** • **DynamoDB** • **Amazon S3**

| Technology | Purpose |
|---|---|
| ⚛️ **React** | Frontend application and interactive UI |
| 🔷 **TypeScript** | Type-safe application development |
| ⚡ **Vite** | Frontend development and production build |
| ☁️ **AWS Amplify** | Frontend hosting and deployment |
| 🔐 **Amazon Cognito** | User authentication |
| 🌐 **Amazon API Gateway** | Backend API entry point |
| λ **AWS Lambda** | Serverless backend logic |
| 🗄️ **Amazon DynamoDB** | Application data and private Proof Locker data |
| 📦 **Amazon S3** | Item media storage |
| 🏗️ **AWS CDK** | Infrastructure as Code |
| 📡 **Amazon CloudWatch** | AWS service logs and operational monitoring |

---

# 🎯 Overview

**ReclaimX** is a privacy-preserving lost-and-found platform designed to help lost items return to their rightful owners.

Traditional lost-and-found systems usually focus on **matching descriptions**.

ReclaimX introduces an additional layer:

> **A match is not proof of ownership.**

The platform separates the recovery process into four stages:

```text
LOST → MATCHED → VERIFIED → RECLAIMED
```

A potential match is discovered using item information, while ownership is verified separately using private clues stored inside the Proof Locker.

The claimant never receives the private proof itself.

Instead, ReclaimX asks verification questions and checks the claimant's answers against the stored proof on the backend.

ReclaimX provides:
- 🔎 Lost and found item discovery
- 🧩 Potential item matching
- 🔐 Private Proof Locker
- ❓ Ownership verification questions
- ✅ Server-side ownership verification
- 🔑 Temporary handover codes
- 📦 Reclaimed item tracking
- 👤 User authentication
- 🖼️ Item media storage
- ☁️ AWS-powered infrastructure

## 🚨 Problem

Lost-and-found platforms have a fundamental challenge:

How can a platform determine whether someone claiming an item is actually its owner?

Public listings need enough information to help identify potential matches. However, exposing every identifying detail can make it easier for someone to falsely claim an item.

For example:

```text
Public Listing
      │
      ▼
"Black backpack found near the library"
      │
      ▼
Potential claimant sees the information
      │
      ▼
Claims the item
```

A description match alone does not establish ownership. The problem can therefore be separated into two different questions:

1. Does this lost item potentially match this found item?
2. Can the claimant prove that they are the owner?

ReclaimX addresses both questions separately.

```text
PUBLIC MATCHING
       +
PRIVATE OWNERSHIP PROOF
       ↓
   VERIFICATION
```

## 💡 Solution

ReclaimX introduces the Proof Locker, a private ownership-verification layer between matching and handover.

When a finder reports an item, they can store additional ownership clues privately, kept separate from the publicly visible item information.

```text
                    Found Item
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
      Public Information      Private Proof
             │                     │
             ▼                     ▼
       Matching Engine         Proof Locker
             │                     │
             ▼                     │
      Potential Match              │
             │                     │
             └──────────┬──────────┘
                         ▼
                  Claimant Answers
                         │
                         ▼
                 Server-Side Check
                         │
                         ▼
                Verification Result
```

The private proof remains on the backend during verification. Only the verification result is returned to the claimant.

## 🔐 Proof Locker

The Proof Locker is the core privacy feature of ReclaimX. Instead of publishing every identifying detail about a found item, the finder can keep specific ownership clues private.

### Example

A finder reports:

```text
Item: Black Backpack
Location: University Library
Category: Backpack
```

The finder can additionally store private ownership clues, for example:

```text
Private Proof:
- Specific marking
- Unique characteristic
- Detail known only to the owner
```

The claimant does not receive these clues. Instead, ReclaimX presents verification questions. The claimant provides their answers, and the backend compares those answers with the private proof.

```text
Finder
  │
  │ Stores private clues
  ▼
Proof Locker
  │
  ▼
Verification Questions
  │
  ▼
Claimant Answers
  │
  ▼
AWS Lambda
  │
  ▼
Private Proof Retrieved
  │
  ▼
Server-Side Comparison
  │
  ▼
Verification Result
```

### Privacy principle

```text
Private Proof
     │
     ▼
   Backend
     │
     ├── Compare answers
     │
     └── Return result only
              │
              ▼
          Claimant
```

The actual private proof is not exposed through the verification result.

## 🧩 Recovery Journey

ReclaimX organizes recovery into four clear stages.

### 1. LOST

A user reports an item they have lost.

```text
Lost Item
   ↓
Description
Location
Category
Characteristics
```

### 2. MATCHED

ReclaimX compares lost and found reports to identify potential matches.

```text
Lost Item
    │
    ├── Category
    ├── Location
    ├── Time
    └── Characteristics
          │
          ▼
    Matching Engine
          │
          ▼
   Potential Match
```

A potential match is not automatically treated as proof of ownership.

### 3. VERIFIED

The claimant goes through the ownership verification process.

```text
Potential Match
      ↓
Verification Questions
      ↓
Claimant Answers
      ↓
Server-Side Verification
      ↓
Ownership Verified
```

### 4. RECLAIMED

After successful verification, ReclaimX provides a temporary handover code.

```text
Ownership Verified
        ↓
Temporary Handover Code
        ↓
Physical Handover
        ↓
RECLAIMED
```

## ☁️ AWS Architecture

ReclaimX uses AWS for frontend hosting, authentication, API access, serverless processing, database storage, and item media.

```text
                         ┌─────────────────┐
                         │ Amazon Cognito  │
                         │ Authentication  │
                         └────────┬────────┘
                                  │
                                  ▼
┌───────────────┐       ┌─────────────────┐
│ React +       │──────▶│  AWS Amplify    │
│ TypeScript    │       │    Hosting      │
└───────────────┘       └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Amazon API      │
                         │ Gateway         │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ AWS Lambda      │
                         │ Serverless API  │
                         └───────┬─┬───────┘
                                 │ │
                    ┌────────────┘ └────────────┐
                    ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │ Amazon DynamoDB │         │    Amazon S3    │
          │ Application     │         │ Item Media      │
          │ Data / Claims   │         │ Images          │
          │ Proof Locker    │         │                 │
          └─────────────────┘         └─────────────────┘
```

### 🏗️ AWS Services

| AWS Service | How ReclaimX Uses It |
|---|---|
| 🚀 AWS Amplify | Hosts and deploys the React frontend |
| 🔐 Amazon Cognito | Handles user authentication |
| 🌐 Amazon API Gateway | Provides the backend API entry point |
| λ AWS Lambda | Executes serverless application and verification logic |
| 🗄️ Amazon DynamoDB | Stores application data and private Proof Locker information |
| 📦 Amazon S3 | Stores item media |
| 📡 Amazon CloudWatch | AWS service logs and operational monitoring |
| 🏗️ AWS CDK | Defines and deploys AWS infrastructure as code |

## 🔒 Privacy Architecture

A key design requirement of ReclaimX is that private ownership proof should not be exposed to the frontend. The verification flow is handled server-side.

```text
                    Claimant
                       │
                       │ Answers
                       ▼
                Amazon API Gateway
                       │
                       ▼
                  AWS Lambda
                       │
                       │ Retrieves
                       ▼
                Amazon DynamoDB
                       │
                  Private Proof
                       │
                       ▼
                Server-Side Check
                       │
                       ▼
              Verification Result
                       │
                       ▼
                    Client
```

This creates a clear separation between public item information and private ownership proof.

```text
Public Item Data
       │
       ▼
   Matching
       │
       ▼
Potential Match


Private Proof
       │
       ▼
Server Verification
       │
       ▼
Verification Result
```

## 🔄 Application Flow

```text
┌─────────────────────┐
│     User Login       │
│  Amazon Cognito       │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│ Report Lost / Found  │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│   Potential Match     │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│    Submit Claim       │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│    Proof Locker       │
│ Private Verification  │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│ Server-Side Check     │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│ Ownership Verified    │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│ Temporary Handover    │
│        Code           │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│      RECLAIMED        │
└─────────────────────┘
```

## ✨ Key Features

### 🔎 Discover
Browse lost and found items and identify potential matches.

### 📝 Report Lost
Create a lost-item report with relevant item information.

### 📦 Report Found
Create a found-item report and optionally provide private ownership clues.

### 🔐 Proof Locker
Store private ownership clues separately from publicly visible item information.

### ❓ Ownership Verification
Ask verification questions without exposing the stored private proof.

### ✅ Server-Side Verification
Private proof remains on the backend during the verification process.

### 🔑 Handover Code
Use a temporary code to complete the physical transfer.

### 📍 Recovery Status
Track the item through:

```text
LOST → MATCHED → VERIFIED → RECLAIMED
```

### 👤 Authentication
Users authenticate through Amazon Cognito.

### 🖼️ Item Media
Item images and media are stored using Amazon S3.

## 🎨 Design

ReclaimX uses a premium editorial interface designed around clarity and trust.

The interface focuses on:

- Strong typography
- Compact navigation
- Thin borders
- Dark neutral surfaces
- Restrained violet and cyan accents
- Subtle motion
- Clear recovery states
- Progressive interaction feedback

Motion is used to reinforce the recovery journey rather than functioning as purely decorative animation.

## 🧪 Testing

The project includes validation of the application and AWS infrastructure.

Key checks include:

- TypeScript type checking
- Production frontend build
- AWS CDK synthesis
- Authentication flow
- Lost-item reporting
- Found-item reporting
- Potential matching
- Claim submission
- Proof Locker verification
- Handover flow
- Reclaimed state
- AWS API integration
- Frontend validation

```bash
pnpm typecheck
pnpm build
```

Infrastructure validation:

```bash
cd infra
npx cdk synth
```

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- pnpm
- AWS CLI
- An AWS account

### Clone the Repository

```bash
git clone https://github.com/vishanth14/reclaimx.git
cd reclaimx
```

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root.

```env
VITE_BACKEND=aws
VITE_AWS_REGION=ap-south-1
VITE_API_BASE_URL=<API_GATEWAY_URL>
VITE_COGNITO_USER_POOL_ID=<COGNITO_USER_POOL_ID>
VITE_COGNITO_CLIENT_ID=<COGNITO_CLIENT_ID>
VITE_IMAGE_BASE_URL=<S3_BUCKET_NAME>
```

Do not commit `.env` files or credentials to the repository.

### Run Locally

```bash
pnpm dev
```

## 🏗️ Deploying the AWS Infrastructure

The AWS infrastructure is defined using AWS CDK.

Navigate to the infrastructure directory:

```bash
cd infra
```

Synthesize the CloudFormation template:

```bash
npx cdk synth
```

Deploy the stack:

```bash
npx cdk deploy ReclaimXStack --require-approval never
```

The infrastructure is deployed in:

```text
AWS Region: ap-south-1 (Asia Pacific — Mumbai)
```

## 📁 Project Structure

```text
reclaimx/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── public/
│   └── images/
│       └── items/
│
├── infra/
│   ├── bin/
│   ├── lib/
│   └── cdk.json
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.*
└── README.md
```

## 🧠 Core Design Principle

The central concept behind ReclaimX is:

```text
                 MATCHING
                    │
                    ▼
             Potential Match
                    │
                    ▼
               OWNERSHIP
              VERIFICATION
                    │
                    ▼
                 HANDOVER
                    │
                    ▼
                RECLAIMED
```

A matching system can identify that two reports appear related. It cannot, by itself, establish that the person making the claim is the rightful owner.

ReclaimX therefore separates discovery from verification.

**Match first. Prove ownership privately. Reclaim safely.**

## 🌍 Why ReclaimX?

Lost-and-found systems are often treated as simple listing platforms. ReclaimX treats recovery as a trust and verification problem.

The platform combines:

```text
Lost & Found Discovery
          +
Potential Matching
          +
Private Ownership Proof
          +
Server-Side Verification
          +
Controlled Handover
```

This creates a complete recovery journey rather than simply connecting two item listings.

## 🏆 Hackathon

ReclaimX was built as a solo project for an AWS-focused hackathon. The project demonstrates how serverless AWS infrastructure can be used to build a privacy-conscious application while keeping the recovery experience simple.

```text
AWS Amplify
     ↓
API Gateway
     ↓
AWS Lambda
   ↙     ↘
DynamoDB  Amazon S3

Amazon Cognito
     ↓
Authentication
```

## 👨‍💻 Developer

**Vishanth K**
Solo Developer
Computer Science & Engineering
