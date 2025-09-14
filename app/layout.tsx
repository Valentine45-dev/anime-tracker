import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AniTrack - Track Your Anime Journey",
  description: "Track your favorite anime and TV series, join communities, and get AI-powered recommendations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
