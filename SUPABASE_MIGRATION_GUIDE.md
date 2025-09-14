# Supabase Migration Guide

This guide will help you migrate your AniTrack application from SQLite/Prisma to Supabase PostgreSQL.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Environment Setup**: Have your development environment ready

## Step 1: Set Up Supabase Project

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `anitrack`
5. Enter database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

### 1.2 Get Project Credentials
1. Go to Project Settings > API
2. Copy the following values:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret!)

## Step 2: Set Up Database Schema

### 2.1 Run SQL Schema
1. In your Supabase dashboard, go to SQL Editor
2. Copy the entire SQL schema provided in the user's message
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

### 2.2 Verify Tables
Go to Table Editor and verify these tables were created:
- `profiles`
- `anime_metadata`
- `user_anime`
- `communities`
- `community_members`
- `posts`
- `post_likes`
- `post_comments`
- `notifications`
- `user_preferences`
- `user_reports`
- `content_reports`
- `reviews`
- `review_likes`
- `user_activities`
- `user_follows`

## Step 3: Configure Environment Variables

### 3.1 Update .env.local
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Legacy (can be removed after migration)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# AniList API
ANILIST_API_URL="https://graphql.anilist.co"
```

### 3.2 Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

## Step 4: Migrate Existing Data

### 4.1 Run Migration Script
```bash
npm run migrate:supabase
```

This script will:
- Migrate users from Prisma to Supabase profiles
- Migrate anime metadata
- Migrate user anime lists
- Migrate reviews

### 4.2 Verify Migration
Check your Supabase dashboard to ensure data was migrated correctly.

## Step 5: Update Application Code

### 5.1 Update Authentication Provider

Replace the current auth provider in `app/layout.tsx`:

```tsx
// Replace this:
import { AuthProvider } from "@/components/providers/auth-provider"

// With this:
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"

// And update the provider:
<SupabaseAuthProvider>{children}</SupabaseAuthProvider>
```

### 5.2 Update Components

Update components to use the new Supabase auth hook:

```tsx
// Replace this:
import { useAuth } from "@/hooks/use-auth"

// With this:
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider"

// Update the hook usage:
const { user, profile, signIn, signOut } = useSupabaseAuth()
```

### 5.3 Update API Routes

Replace API routes to use Supabase:

```tsx
// Replace this:
import { getUserByEmail, verifyPassword } from '@/lib/auth'

// With this:
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
```

## Step 6: Test Migration

### 6.1 Test Authentication
1. Try signing up with a new account
2. Try signing in with existing credentials
3. Test profile updates
4. Test sign out

### 6.2 Test Anime Features
1. Search for anime
2. Add anime to your list
3. Update anime status and progress
4. View your anime list
5. Remove anime from list

### 6.3 Test Community Features
1. Create a community
2. Join communities
3. Create posts
4. Comment on posts
5. Like posts and comments

## Step 7: Deploy to Production

### 7.1 Update Production Environment
Add the same environment variables to your production environment.

### 7.2 Deploy Application
Deploy your updated application with Supabase integration.

### 7.3 Run Production Migration
If you have production data, run the migration script against your production database.

## Benefits of Supabase Migration

### 🚀 **Enhanced Features**
- **Real-time subscriptions** for live updates
- **Built-in authentication** with social providers
- **Row Level Security** for data protection
- **Advanced querying** with PostgreSQL
- **Automatic API generation**

### 🔒 **Better Security**
- **Database-level security** with RLS policies
- **Secure authentication** with JWT tokens
- **Protected API endpoints**
- **User data isolation**

### 📈 **Improved Performance**
- **Better indexing** for faster queries
- **Connection pooling** for scalability
- **Caching strategies** built-in
- **Optimized queries** with PostgreSQL

### 🛠 **Developer Experience**
- **Type-safe database** operations
- **Auto-generated types** from schema
- **Built-in admin panel** (Supabase Dashboard)
- **Real-time monitoring** and logs

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
Error: Invalid JWT token
```
**Solution**: Check your Supabase URL and keys in environment variables.

#### 2. RLS Policy Errors
```bash
Error: new row violates row-level security policy
```
**Solution**: Ensure RLS policies are correctly set up and user is authenticated.

#### 3. Migration Errors
```bash
Error: relation does not exist
```
**Solution**: Run the complete SQL schema in Supabase SQL Editor.

#### 4. Type Errors
```bash
Error: Property 'profile' does not exist
```
**Solution**: Update components to use `useSupabaseAuth` instead of `useAuth`.

### Getting Help

1. **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
2. **Community Discord**: [discord.supabase.com](https://discord.supabase.com)
3. **GitHub Issues**: Create an issue in your project repository

## Rollback Plan

If you need to rollback to the previous system:

1. **Keep Prisma dependencies** until migration is fully tested
2. **Maintain SQLite database** as backup
3. **Use feature flags** to switch between systems
4. **Test thoroughly** before removing old code

## Next Steps

After successful migration:

1. **Remove Prisma dependencies** from package.json
2. **Delete old database files** (dev.db)
3. **Update documentation** to reflect new architecture
4. **Implement advanced features** like real-time notifications
5. **Set up monitoring** and analytics
6. **Plan for scaling** with Supabase features

## Support

For questions about this migration:
- Check the Supabase documentation
- Review the migration plan in `MIGRATION_PLAN.md`
- Test thoroughly in development before production deployment
