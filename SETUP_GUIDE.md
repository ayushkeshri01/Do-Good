# Neki Setup Guide

A step-by-step guide to set up your Neki application.

---

## 1. Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A PostgreSQL database (local or cloud)
- A Google Cloud account
- An AWS account (for S3 storage)

---

## 2. Environment Variables

Edit the `.env` file in the project root:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# NextAuth - Generate a secret with:
# openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"

# Google OAuth (see Section 3)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 (see Section 4)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="neki-uploads"
```

---

## 3. Google OAuth Setup

### Step 3.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Neki" and click "Create"

### Step 3.2: Enable Google+ API

1. In the sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3.3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" and click "Create"
3. Fill in the details:
   - App name: `Neki`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip "Scopes" (click "Save and Continue")
6. For "Test users", add your own Google email (important!)
7. Click "Save and Continue"

### Step 3.4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `Neki Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

### Step 3.5: Update .env

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 4. AWS S3 Setup

### Step 4.1: Create S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to "S3" service
3. Click "Create bucket"
4. Bucket name: `neki-uploads` (must be globally unique)
5. AWS Region: Choose closest to your users (e.g., `us-east-1`)
6. Uncheck "Block all public access" (we need public read for images)
7. Acknowledge the warning
8. Click "Create bucket"

### Step 4.2: Configure Bucket for Public Access

1. Select your bucket
2. Go to "Permissions" tab
3. Edit "Block public access"
4. Uncheck "Block all public access"
5. Save changes

### Step 4.3: Add Bucket Policy

1. In bucket "Permissions", find "Bucket policy"
2. Click "Edit" and add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::neki-uploads/*"
    }
  ]
}
```

Replace `neki-uploads` with your bucket name.

### Step 4.4: Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Name: `neki-uploader`
4. Select "Attach policies directly"
5. Search and attach: `AmazonS3FullAccess` (or create a custom policy with only PutObject)
6. Click "Next" → "Create user"

### Step 4.5: Get Access Keys

1. Click on the created user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Select "Application running outside AWS"
5. Click "Next" and add a description
6. Click "Create access key"
7. Copy:
   - **Access Key ID**
   - **Secret Access Key**

### Step 4.6: Update .env

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="neki-uploads"
```

---

## 5. Database Setup (PostgreSQL)

### Option A: Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. Create database:
   ```bash
   createdb neki
   ```

3. Create user (optional):
   ```bash
   psql -d neki -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
   psql -d neki -c "GRANT ALL PRIVILEGES ON DATABASE neki TO myuser;"
   ```

### Option B: Cloud Database (Recommended for Production)

Use services like:
- **Supabase** (free tier available)
- **Neon** (free tier available)
- **Railway** (pay-as-you-go)
- **Render** (free tier available)

1. Create a PostgreSQL database
2. Get the connection URL (looks like: `postgresql://user:pass@host:5432/dbname`)
3. Update `DATABASE_URL` in `.env`

### Option C: Docker

```bash
docker run --name neki-db -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=neki -p 5432:5432 -d postgres
```

### Step 5.1: Update .env

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/neki"
```

### Step 5.2: Run Database Migration

```bash
cd neki
npm run db:migrate
```

This creates all the tables.

### Step 5.3: Generate Prisma Client

```bash
npm run db:generate
```

---

## 6. Creating the Admin Account

### Step 6.1: Edit the Admin Script

Open `scripts/create-admin.ts` and update these variables:

```typescript
// ============================================
// EDIT THESE VARIABLES BEFORE RUNNING
// ============================================
const ADMIN_EMAIL = "your-google-email@gmail.com"; // Your Google email
const ADMIN_NAME = "Your Name"; // Your display name
// ============================================
```

### Step 6.2: Run the Script

```bash
npm run admin:create
```

### Step 6.3: Expected Output

```
Admin created successfully!
Email: your-google-email@gmail.com
Name: Your Name
Role: ADMIN
Allowed domain: gmail.com

Next steps:
1. Set up Google OAuth credentials in .env
2. Run 'npx prisma migrate dev' to create database tables
3. Start the app with 'npm run dev'
```

**Note:** The domain restriction will automatically use the domain from the admin's email (e.g., `gmail.com`).

---

## 7. Running the Application

### Development

```bash
npm run dev
```

Open http://localhost:3000

### First Login

1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Sign in with the admin email you configured
4. You should be logged in as admin

---

## 8. Troubleshooting

### "Invalid client_id" Error
- Check that `GOOGLE_CLIENT_ID` is correctly set
- Ensure the domain in the email matches your configured domain

### "Connection refused" Error
- PostgreSQL might not be running
- Check `DATABASE_URL` is correct

### "S3 bucket not found"
- Verify `AWS_S3_BUCKET` matches exactly
- Check AWS credentials are correct

### CORS Errors with S3
- Add CORS configuration in bucket settings:
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```

---

## 9. Production Deployment Checklist

Before going live:

- [ ] Set up production database (not local)
- [ ] Configure production S3 bucket
- [ ] Update `AUTH_URL` to production domain
- [ ] Add production domains to Google OAuth
- [ ] Set secure `AUTH_SECRET` (use a long random string)
- [ ] Enable HTTPS on production
- [ ] Set up proper CORS rules for S3
- [ ] Test admin panel
- [ ] Create initial communities

---

## Quick Setup Summary

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **Google OAuth** | Client ID & Secret | Google Cloud Console |
| **PostgreSQL** | Connection URL | Local install or cloud provider |
| **AWS S3** | Access Key ID, Secret Access Key, Bucket Name | AWS Console |
| **Admin Account** | Your Google email | Any Google account |

---

Need help? Check the project documentation or create an issue on GitHub.
