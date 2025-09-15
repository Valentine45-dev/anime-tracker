# 🎌 AniTrack - Personal Anime Tracker

A modern, full-featured anime tracking platform built with Next.js 15 and Supabase. Track your anime journey, discover new series, and manage your personal anime lists with a beautiful, responsive interface.

## ✨ Implemented Features

### 🎯 Core Anime Management
- **📊 Personal Anime Lists**: Complete anime list management with 5 status categories (Watching, Completed, On-Hold, Dropped, Plan to Watch)
- **⭐ Rating System**: Rate anime with 1-10 star scale
- **📈 Progress Tracking**: Track episode progress and completion status
- **📝 Personal Notes**: Add custom notes to your anime entries
- **🔄 Status Management**: Move anime between different status categories

### 🔍 Discovery & Search
- **📈 Trending Anime**: Browse trending anime from AniList API
- **🤖 AI Recommendations**: Get personalized anime recommendations
- **🎯 Smart Filtering**: Filter anime by genres, studios, ratings, and more
- **🔍 Anime Details**: Detailed anime information pages with full metadata

### 🛠️ Technical Features
- **📊 Personal Dashboard**: View your anime organized by status
- **🌙 Theme System**: Beautiful dark/light theme with system preference detection
- **📱 Mobile-First**: Fully responsive design optimized for all devices
- **⚡ Real-time Updates**: Live updates when adding anime to your lists
- **🔐 Secure Authentication**: Modern authentication with Supabase Auth
- **💾 Data Persistence**: All data stored securely in Supabase PostgreSQL database

### 🎛️ User Experience
- **🎨 Modern UI**: Clean, intuitive interface built with shadcn/ui components
- **⚡ Fast Performance**: Optimized with Next.js 15 and React 19
- **🔄 Seamless Navigation**: Smooth transitions between pages and features
- **📱 Cross-Platform**: Works perfectly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React icon library
- **Charts**: Recharts for data visualization

### Backend & Database
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Authentication**: Supabase Auth with OAuth providers
- **API**: Next.js API routes with TypeScript
- **Caching**: Built-in caching with Redis support
- **File Storage**: Supabase Storage for media files

### External Services
- **Anime Data**: AniList GraphQL API integration
- **Email Service**: Custom email service with template system
- **Analytics**: Custom analytics and monitoring system
- **Background Jobs**: Automated background processing

### Development Tools
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint, Prettier, and strict TypeScript config
- **Database**: Prisma ORM with migration support
- **Testing**: Jest and React Testing Library setup
- **Deployment**: Vercel-ready with environment configuration

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (recommended) or npm
- **Supabase Account** (for database and authentication)
- **Git** (for version control)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anime-tracker-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Supabase**
   
   Create a new project at [supabase.com](https://supabase.com) and get your credentials.

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update the `.env.local` file with your Supabase configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
   
   # AniList API (no key required)
   ANILIST_API_URL="https://graphql.anilist.co"
   ```

5. **Set up the database**
   
   Run the SQL setup script in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the entire script from lib/fix-all-rls-policies.sql
   -- This will create the development user and disable RLS for development
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🎮 How to Use

### 📊 Dashboard
- **View your personal anime lists** organized by status (Watching, Completed, On-Hold, Dropped, Plan to Watch)
- **See your ratings and progress** for each anime
- **Empty lists** show helpful links to discover new anime

### 🔍 Discover Anime
- **Trending Page**: Browse popular anime from AniList API
- **Recommendations Page**: Get AI-powered anime recommendations
- **Anime Details**: Click on any anime to see detailed information

### ➕ Add Anime to Your List
1. **Browse** trending anime or recommendations
2. **Click "Add to List"** on any anime card
3. **Choose status** (Watching, Completed, On-Hold, Dropped, Plan to Watch)
4. **Rate the anime** (1-10 stars)
5. **Add notes** (optional)
6. **Click "Add to List"** to save

### 📱 Your Personal Lists
- **Dashboard** shows all your anime organized by status
- **Real-time updates** when you add new anime
- **Rating system** to track your preferences
- **Progress tracking** for ongoing series

   ### 🔧 Admin Setup

#### Step 1: Database Setup
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL script from `/admin/setup` page
4. Click "Run" to execute the script

#### Step 2: Create Admin Account
1. Go to `/admin/create` to create your first super admin account
2. Enter your name, email, and password
3. Click "Create Super Admin"
4. You'll be redirected to the admin dashboard

#### Step 3: Access Admin Features
- **Admin Dashboard**: `/admin` - View system analytics and user management
- **Admin Login**: `/admin/login` - Sign in to admin panel
- **Admin Setup**: `/admin/setup` - Complete setup guide with SQL scripts

#### Admin Features
- **User Management**: View and manage user accounts
- **System Analytics**: Monitor user activity and system health
- **Content Moderation**: Manage communities and user reports
- **Audit Logging**: Track all admin actions for security

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/login` - User login (legacy JWT)
- `POST /api/auth/signup` - User registration (legacy JWT)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/supabase-login` - Supabase authentication
- `POST /api/auth/supabase-signup` - Supabase user registration
- `POST /api/auth/supabase-logout` - Supabase logout
- `POST /api/auth/create-user` - Create user profile

### 🎌 Anime Management
- `GET /api/anime/search?q={query}` - Search anime with filters
- `GET /api/anime/[id]` - Get detailed anime information
- `GET /api/anime/trending` - Get trending anime with sorting options
- `GET /api/supabase-anime/search` - Supabase-powered anime search

### 📊 User Anime Lists
- `GET /api/user/anime-list` - Get user's complete anime list
- `POST /api/user/anime-list` - Add anime to user's list
- `PUT /api/user/anime-list/[id]` - Update anime entry (status, progress, rating)
- `DELETE /api/user/anime-list/[id]` - Remove anime from list
- `GET /api/supabase-user/anime-list` - Supabase-powered anime list management

### 👥 Community Features
- `GET /api/communities` - Get all communities with filtering
- `POST /api/communities` - Create new community
- `PUT /api/communities/[id]` - Update community settings
- `DELETE /api/communities/[id]` - Delete community

### 🤖 Recommendations
- `GET /api/recommendations` - Get personalized anime recommendations
- `POST /api/recommendations/refresh` - Refresh recommendation algorithm

### 📈 Dashboard & Analytics
- `GET /api/dashboard/anime` - Get user dashboard anime data
- `GET /api/admin/analytics` - Admin analytics and metrics
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - User management endpoints

### 🔔 Notifications & Admin
- `GET /api/admin/notifications` - System notifications
- `POST /api/admin/notifications` - Send notifications
- `GET /api/admin/check` - Admin status check
- `POST /api/admin/init` - Initialize admin settings
- `POST /api/admin/migration` - Run database migrations

## 🗄️ Database Schema

The application uses **Supabase PostgreSQL** with comprehensive data models and real-time capabilities:

### 👤 User Management
- **`profiles`**: User profiles with preferences, watch time, and favorite genres
- **`user_preferences`**: Theme, language, and notification settings
- **`user_activities`**: Activity tracking and analytics
- **`user_follows`**: User following system
- **`user_reports`**: User reporting and moderation

### 🎌 Anime & Content
- **`anime_metadata`**: Comprehensive anime data from AniList API
- **`user_anime`**: User's personal anime lists with progress tracking
- **`reviews`**: User reviews and ratings system
- **`review_likes`**: Review interaction system

### 👥 Community System
- **`communities`**: Anime communities and clubs
- **`community_members`**: Community membership with roles
- **`posts`**: Community posts and discussions
- **`post_likes`**: Post interaction system
- **`post_comments`**: Nested comment system
- **`content_reports`**: Content moderation system

### 🔔 System Features
- **`notifications`**: Real-time notification system
- **`user_activities`**: Comprehensive activity tracking
- **`user_reports`**: User reporting system
- **`content_reports`**: Content moderation

### 🔒 Security Features
- **Row Level Security (RLS)**: Comprehensive data protection
- **Real-time subscriptions**: Live updates for communities and notifications
- **Audit trails**: Complete activity logging
- **Data validation**: Type-safe database operations

## 🛠️ Development

### 📜 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database (Legacy Prisma - being migrated to Supabase)
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Create and run migrations
pnpm db:studio        # Open Prisma Studio

# Setup & Utilities
pnpm setup            # Run initial setup script
```

### 🏗️ Project Structure

```
anime-tracker-app/
├── 📁 app/                          # Next.js 15 App Router
│   ├── 📁 admin/                    # Admin panel pages
│   │   ├── 📁 login/               # Admin authentication
│   │   ├── 📁 settings/            # Admin settings
│   │   └── 📁 setup/               # Initial admin setup
│   ├── 📁 api/                     # API routes
│   │   ├── 📁 admin/               # Admin API endpoints
│   │   ├── 📁 anime/               # Anime-related APIs
│   │   ├── 📁 auth/                # Authentication APIs
│   │   ├── 📁 communities/         # Community APIs
│   │   ├── 📁 dashboard/           # Dashboard APIs
│   │   ├── 📁 recommendations/     # Recommendation APIs
│   │   ├── 📁 supabase-anime/      # Supabase anime APIs
│   │   └── 📁 supabase-user/       # Supabase user APIs
│   ├── 📁 auth/                    # Authentication pages
│   ├── 📁 communities/             # Community pages
│   ├── 📁 recommendations/         # Recommendation pages
│   ├── 📁 trending/                # Trending anime page
│   └── 📁 profile/                 # User profile pages
├── 📁 components/                   # React components
│   ├── 📁 providers/               # Context providers
│   └── 📁 ui/                      # shadcn/ui components
├── 📁 hooks/                       # Custom React hooks
├── 📁 lib/                         # Utility libraries
│   ├── 📄 admin-auth.ts           # Admin authentication
│   ├── 📄 admin-setup.sql         # Database schema
│   ├── 📄 analytics.ts            # Analytics system
│   ├── 📄 anilist.ts              # AniList API integration
│   ├── 📄 auth.ts                 # Authentication utilities
│   ├── 📄 email-service.ts        # Email notification system
│   ├── 📄 supabase.ts             # Supabase client
│   ├── 📄 supabase-auth.ts        # Supabase authentication
│   └── 📄 utils.ts                # Utility functions
├── 📁 prisma/                      # Database schema (legacy)
├── 📁 scripts/                     # Setup and migration scripts
└── 📁 public/                      # Static assets
```

### 🔧 Development Features

- **🔄 Hot Reload**: Instant updates during development
- **📊 Type Safety**: Full TypeScript coverage with strict mode
- **🎨 Component Library**: Comprehensive UI component system
- **🔍 Code Quality**: ESLint, Prettier, and automated formatting
- **📱 Responsive Design**: Mobile-first development approach
- **🌙 Theme System**: Dark/light mode with system preference detection
- **⚡ Performance**: Optimized builds with Next.js 15 features

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL="your_production_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_production_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_production_service_role_key"
ANILIST_API_URL="https://graphql.anilist.co"
```

### Database Migration
- Run the Supabase SQL schema in production
- Configure Row Level Security policies
- Set up email templates and authentication settings

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript types
4. **Test your changes** thoroughly
5. **Commit with conventional commits**: `git commit -m 'feat: add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a detailed description

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component library (shadcn/ui)
- Maintain responsive design principles
- Write comprehensive commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Core Technologies
- **[AniList](https://anilist.co/)** - Comprehensive anime database and API
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Design & Icons
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Recharts](https://recharts.org/)** - Composable charting library

### Special Thanks
- The anime community for inspiration and feedback
- Open source contributors who made this project possible
- All users who help improve the platform through feedback and contributions

---

<div align="center">

**Made with ❤️ for the anime community**

[🌟 Star this repo](https://github.com/your-username/anime-tracker-app) • [🐛 Report Bug](https://github.com/your-username/anime-tracker-app/issues) • [💡 Request Feature](https://github.com/your-username/anime-tracker-app/issues)

</div>
