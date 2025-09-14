# Migration Plan: SQLite/Prisma to Supabase

## Overview
This document outlines the migration strategy from the current SQLite/Prisma setup to the new Supabase PostgreSQL database.

## Phase 1: Environment Setup

### 1.1 Install Supabase Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

### 1.2 Environment Variables
Update `.env.local`:
```env
# Remove old database config
# DATABASE_URL="file:./dev.db"

# Add Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Phase 2: Database Migration

### 2.1 Run Supabase SQL Schema
Execute the provided SQL schema in your Supabase SQL Editor to create all tables, policies, and functions.

### 2.2 Data Migration Script
Create a migration script to transfer existing data from SQLite to Supabase.

## Phase 3: Code Migration

### 3.1 Replace Prisma with Supabase Client
- Remove `lib/prisma.ts`
- Create `lib/supabase.ts` with Supabase client configuration
- Update all database operations to use Supabase client

### 3.2 Authentication Migration
- Replace custom JWT auth with Supabase Auth
- Update `lib/auth.ts` to use Supabase Auth methods
- Update authentication components and hooks

### 3.3 API Routes Migration
- Update all API routes to use Supabase instead of Prisma
- Implement proper error handling for Supabase operations
- Update middleware for Supabase Auth

### 3.4 Component Updates
- Update authentication provider to use Supabase Auth
- Update hooks to work with Supabase client
- Update components that interact with database

## Phase 4: New Features Implementation

### 4.1 Enhanced Anime Tracking
- Implement the new `user_anime` table with additional fields
- Add progress tracking and rating features
- Implement anime metadata caching

### 4.2 Community Features
- Implement community creation and management
- Add post and comment functionality
- Implement user roles and permissions

### 4.3 Advanced Features
- Add notifications system
- Implement user follows and activities
- Add review and rating system

## Phase 5: Testing and Optimization

### 5.1 Testing
- Test all authentication flows
- Test anime tracking functionality
- Test community features
- Performance testing with RLS policies

### 5.2 Optimization
- Optimize database queries
- Implement caching strategies
- Add proper error boundaries

## Migration Checklist

- [ ] Set up Supabase project
- [ ] Install Supabase dependencies
- [ ] Run database schema
- [ ] Create Supabase client configuration
- [ ] Migrate authentication system
- [ ] Update API routes
- [ ] Update components and hooks
- [ ] Test all functionality
- [ ] Deploy to production

## Benefits of Migration

1. **Better Authentication**: Built-in auth with social providers
2. **Row Level Security**: Database-level security policies
3. **Real-time Features**: Built-in real-time subscriptions
4. **Better Performance**: PostgreSQL with proper indexing
5. **Advanced Features**: Notifications, follows, activities
6. **Scalability**: Better suited for production deployment
7. **Type Safety**: Better TypeScript integration
