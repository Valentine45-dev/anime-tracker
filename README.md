# AniTrack - Anime Tracker App

A modern anime tracking application built with Next.js, TypeScript, and Prisma, integrated with the AniList API.

## Features

- 🎌 **Anime Tracking**: Track your anime with different statuses (Watching, Completed, On-Hold, Dropped, Plan to Watch)
- 🔍 **Search**: Search for anime using the AniList API
- 🤖 **AI Recommendations**: Get personalized anime recommendations
- 👥 **Communities**: Join anime communities and discuss with fellow fans
- 🌙 **Dark Mode**: Beautiful dark/light theme support
- 📱 **Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **API**: AniList GraphQL API integration
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

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

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ANILIST_API_URL="https://graphql.anilist.co"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push the schema to the database
   pnpm db:push
   
   # Optional: Open Prisma Studio to view your data
   pnpm db:studio
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Anime
- `GET /api/anime/search?q={query}` - Search anime
- `GET /api/anime/[id]` - Get anime details
- `GET /api/anime/trending` - Get trending anime

### User Anime List
- `GET /api/user/anime-list` - Get user's anime list
- `POST /api/user/anime-list` - Add anime to list
- `PUT /api/user/anime-list/[id]` - Update anime in list
- `DELETE /api/user/anime-list/[id]` - Remove anime from list

## Database Schema

The application uses Prisma with SQLite and includes the following main models:

- **User**: User accounts with authentication
- **Anime**: Anime data from AniList API
- **AnimeList**: User's personal anime lists
- **Review**: User reviews and ratings
- **Community**: Anime communities
- **Post**: Community posts
- **Comment**: Post comments

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Create and run migrations
- `pnpm db:studio` - Open Prisma Studio

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── communities/       # Community pages
│   └── recommendations/   # Recommendation pages
├── components/            # React components
│   ├── providers/         # Context providers
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── anilist.ts       # AniList API integration
│   ├── auth.ts          # Authentication utilities
│   ├── anime-list.ts    # Anime list operations
│   └── prisma.ts        # Database client
├── prisma/              # Database schema
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [AniList](https://anilist.co/) for providing the anime data API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Prisma](https://prisma.io/) for the excellent database toolkit
