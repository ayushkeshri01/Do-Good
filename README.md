# Do-Good

A community social work platform where company members can share social work, donations, and volunteer activities.

## Features

- **Community Posts**: Share social work, donations, and volunteer activities
- **Points System**: Earn 50 points per post, climb the leaderboard
- **Community Management**: Join multiple communities, post to multiple at once
- **Dislike System**: Auto-hide posts that receive 15%+ dislikes
- **Admin Panel**: Manage users, communities, posts, and settings
- **Company-Only Access**: Google OAuth restricted to your company domain

## Quick Setup

### 1. Run Setup Wizard

```bash
./setup.sh
```

### 2. Configure Environment

Edit `.env` file with your credentials:

```env
DATABASE_URL="postgresql://..."      # Your PostgreSQL connection
GOOGLE_CLIENT_ID="..."               # From Google Cloud Console
GOOGLE_CLIENT_SECRET="..."          # From Google Cloud Console
AWS_ACCESS_KEY_ID="..."       # From AWS IAM
AWS_SECRET_ACCESS_KEY="..."   # From AWS IAM
AWS_REGION="us-east-1"        # Your AWS region
AWS_S3_BUCKET="..."           # Your S3 bucket name
```

### 3. Create Admin Account

```bash
# Edit scripts/create-admin.ts with your Google email
npm run admin:create
```

### 4. Start Development

```bash
npm run dev
```

## Detailed Setup Guide

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions for:
- Google OAuth setup
- AWS S3 configuration
- PostgreSQL setup
- Creating the admin account

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run admin:create # Create admin user
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui, Base UI
- **Authentication**: NextAuth.js (Google OAuth)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
dogood/
├── app/
│   ├── (auth)/         # Login page
│   ├── (protected)/    # Protected pages (requires auth)
│   │   ├── admin/      # Admin dashboard
│   │   ├── communities/# Community pages
│   │   ├── feed/       # Main feed
│   │   ├── leaderboard/# Leaderboard
│   │   └── profile/    # User profiles
│   └── api/            # API routes
├── components/
│   ├── ui/             # shadcn components
│   ├── layout/         # Layout components
│   ├── posts/          # Post components
│   └── communities/    # Community components
├── lib/
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client
│   ├── s3.ts           # AWS S3 client
├── prisma/
│   └── schema.prisma   # Database schema
└── scripts/
    └── create-admin.ts  # Admin creation script
```

## License

MIT
