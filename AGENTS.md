# Neki - Agent Documentation

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

**Neki** is a community social work platform where company members can share social work, donations, and volunteer activities.

### Key Features
- Community posts with image uploads (AWS S3)
- Points system (+50 points per post)
- Leaderboard ranking
- Multi-community posting
- Dislike system (auto-hide at 15% threshold)
- Admin dashboard for management
- Google OAuth with domain restriction
- Light/Dark theme

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| UI Components | shadcn/ui (default style, NOT base-nova) |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | PostgreSQL + Prisma 5 |
| Storage | AWS S3 (images) |
| Icons | Lucide React |

## Project Structure

```
neki/
├── app/
│   ├── (auth)/                    # Auth routes (public)
│   │   ├── login/page.tsx        # Login page
│   │   └── layout.tsx            # Redirects if logged in
│   ├── (protected)/               # Protected routes (requires auth)
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── page.tsx          # Overview
│   │   │   ├── communities/       # Community management
│   │   │   ├── users/            # User management
│   │   │   ├── posts/            # Post management
│   │   │   └── settings/         # App settings
│   │   ├── communities/           # Community pages
│   │   │   ├── page.tsx          # Browse/join communities
│   │   │   └── [slug]/page.tsx   # Single community view
│   │   ├── feed/page.tsx         # Main feed
│   │   ├── create-post/page.tsx  # Create new post
│   │   ├── leaderboard/page.tsx  # Points leaderboard
│   │   ├── profile/              # User profiles
│   │   │   ├── page.tsx          # Own profile
│   │   │   └── [userId]/page.tsx # Public profile
│   │   └── layout.tsx            # Protected layout with Navbar
│   ├── api/                       # API routes
│   │   ├── auth/                  # NextAuth routes
│   │   ├── posts/                # Post CRUD, like, dislike
│   │   ├── communities/           # Community join/leave
│   │   └── admin/                # Admin operations
│   ├── layout.tsx                 # Root layout (html/body)
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind + theme variables
├── components/
│   ├── ui/                       # shadcn components
│   ├── layout/                   # Navbar, ThemeProvider
│   ├── posts/                    # PostCard, CreatePostForm
│   └── communities/             # CommunityCard
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   ├── s3.ts                     # AWS S3 upload utility
│   └── utils.ts                  # cn(), formatDate(), etc.
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/
│   └── create-admin.ts           # Admin creation script
└── types/
    └── next-auth.d.ts            # Session type extensions
```

## Important Conventions

### Client vs Server Components

**Server Components** (default): Can use `async/await`, access DB directly
**Client Components**: Must have `"use client"` directive, can use hooks, event handlers

```typescript
// Server Component (no "use client" needed)
export default async function FeedPage() {
  const posts = await prisma.post.findMany();
  return <PostFeed posts={posts} />;
}

// Client Component ("use client" required)
"use client";
export function PostCard() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(true)}>Like</button>;
}
```

### UI Components

**ALL UI components MUST have `"use client"` directive** because shadcn/ui uses client-side interactivity:

```typescript
// CORRECT
"use client";
import { Button } from "@/components/ui/button";
export function MyComponent() {
  return <Button onClick={handleClick}>Click me</Button>;
}

// WRONG - Will cause "Event handlers cannot be passed to Client Component props" error
import { Button } from "@/components/ui/button";
export function MyComponent() {
  return <Button onClick={handleClick}>Click me</Button>; // Error!
}
```

### shadcn Setup

- **Style**: Use `default` style, NOT `base-nova`
- **Components.json config**:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true
}
```

### Import Paths

Use path aliases:
```typescript
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
```

## Database Schema

```prisma
User         - id, email, name, image, role, points, banned
Community    - id, name, slug, description, adminId
CommunityMember - userId, communityId (junction table)
Post         - id, content, images[], points, status, authorId
Like         - userId, postId
Dislike      - userId, postId
AppSettings  - allowedDomain, dislikeThreshold
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://neki:neki123@localhost:5432/neki"

# NextAuth
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET="neki-uploads"
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (dev)
npm run db:studio    # Open Prisma Studio
npm run admin:create # Create admin user
```

## Database Commands

```bash
# Initial setup
psql -U postgres -h localhost -c "CREATE USER neki WITH PASSWORD 'neki123';"
psql -U postgres -h localhost -c "CREATE DATABASE neki OWNER neki;"
npm run db:push

# Create admin (edit scripts/create-admin.ts first)
npm run admin:create
```

## Troubleshooting

### "Event handlers cannot be passed to Client Component props"
**Cause**: Component using event handlers (onClick, onChange, etc.) is not marked as client component
**Fix**: Add `"use client"` at the top of the file

### shadcn components using base-ui instead of React
**Cause**: Wrong style configured in components.json
**Fix**: Remove components/ui/* and reinstall:
```bash
rm -rf components/ui/*
# Edit components.json to use "style": "default"
npx shadcn@latest add button card input -y
```

### Auth not working
**Check**:
1. `AUTH_SECRET` is set in .env
2. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
3. Redirect URI in Google Console matches `AUTH_URL`

### Image uploads failing
**Check**:
1. AWS credentials are set
2. S3 bucket exists and is public
3. CORS policy allows the app origin

## Working with Subagents

When requesting fixes or features:

1. **Identify the relevant subagent** based on what was originally built:
   - Layout/Navbar/Theme → Core Layout subagent
   - Posts/Feed → Feed & Posts subagent
   - Communities → Communities subagent
   - Admin → Admin Dashboard subagent

2. **Include context** in the task:
   - What file(s) need changes
   - What the issue/feature is
   - Expected behavior

3. **Example prompt**:
```
Fix the landing page layout issue where content is not centered.
Files: app/page.tsx, app/globals.css
Issue: Extra space on right side, content not centered
```

## Notes for Future Development

- The app uses shadcn/ui - always use `npx shadcn@latest add <component>` to add new UI components
- All pages in `(protected)/` require authentication - the layout handles this
- Admin routes are in `(protected)/admin/` - layout checks for `session.user.role === "ADMIN"`
- Image uploads go to AWS S3 - see `lib/s3.ts` for the upload function
- Points are awarded automatically when creating a post (50 points per post)
- Dislike threshold is configurable in admin settings (default 15%)
