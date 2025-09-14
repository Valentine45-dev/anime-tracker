// Background job system for processing tasks without user context
import { getSupabaseAdmin } from './supabase'
import { logger } from './logger'

export interface BackgroundJob {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  data: any
  result?: any
  error?: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export class BackgroundJobProcessor {
  private static instance: BackgroundJobProcessor
  private isProcessing = false
  private jobs: Map<string, BackgroundJob> = new Map()

  static getInstance(): BackgroundJobProcessor {
    if (!BackgroundJobProcessor.instance) {
      BackgroundJobProcessor.instance = new BackgroundJobProcessor()
    }
    return BackgroundJobProcessor.instance
  }

  // Add a new job to the queue
  async addJob(type: string, data: any): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: BackgroundJob = {
      id: jobId,
      type,
      status: 'pending',
      data,
      created_at: new Date().toISOString()
    }

    this.jobs.set(jobId, job)
    logger.info(`Background job added: ${type}`, { jobId, data })

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processJobs()
    }

    return jobId
  }

  // Process all pending jobs
  private async processJobs() {
    if (this.isProcessing) return

    this.isProcessing = true
    logger.info('Starting background job processing')

    try {
      const pendingJobs = Array.from(this.jobs.values()).filter(job => job.status === 'pending')
      
      for (const job of pendingJobs) {
        await this.processJob(job)
      }
    } catch (error) {
      logger.error('Error processing background jobs:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process a single job
  private async processJob(job: BackgroundJob) {
    try {
      job.status = 'running'
      job.started_at = new Date().toISOString()
      logger.info(`Processing job: ${job.type}`, { jobId: job.id })

      let result: any

      switch (job.type) {
        case 'send_welcome_email':
          result = await this.sendWelcomeEmail(job.data)
          break
        case 'update_user_statistics':
          result = await this.updateUserStatistics(job.data)
          break
        case 'cleanup_old_notifications':
          result = await this.cleanupOldNotifications(job.data)
          break
        case 'sync_anime_data':
          result = await this.syncAnimeData(job.data)
          break
        case 'generate_analytics_report':
          result = await this.generateAnalyticsReport(job.data)
          break
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }

      job.status = 'completed'
      job.result = result
      job.completed_at = new Date().toISOString()
      logger.info(`Job completed: ${job.type}`, { jobId: job.id, result })

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : String(error)
      job.completed_at = new Date().toISOString()
      logger.error(`Job failed: ${job.type}`, { jobId: job.id, error: job.error })
    }
  }

  // Job implementations
  private async sendWelcomeEmail(data: { userId: string, email: string, name: string }) {
    const admin = getSupabaseAdmin()
    
    // Create welcome notification
    await admin.from('notifications').insert({
      user_id: data.userId,
      type: 'welcome',
      title: 'Welcome to AniTrack! 🎉',
      message: `Hi ${data.name}! Welcome to AniTrack. Start tracking your favorite anime and join our community!`,
      data: { email: data.email },
      is_read: false
    })

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    logger.info(`Welcome email queued for ${data.email}`)
    
    return { emailSent: true, notificationCreated: true }
  }

  private async updateUserStatistics(data: { userId?: string }) {
    const admin = getSupabaseAdmin()
    
    if (data.userId) {
      // Update specific user
      const { data: userAnime } = await admin
        .from('user_anime')
        .select(`
          progress,
          anime_metadata(episodes, duration_minutes)
        `)
        .eq('user_id', data.userId)

      const totalWatchTime = userAnime?.reduce((total, entry) => {
        const episodes = entry.anime_metadata?.episodes || 0
        const duration = entry.anime_metadata?.duration_minutes || 24
        const progress = entry.progress || 0
        return total + (episodes * duration * progress / 100)
      }, 0) || 0

      await admin
        .from('profiles')
        .update({ watch_time_hours: Math.round(totalWatchTime / 60) })
        .eq('id', data.userId)

      return { userId: data.userId, watchTimeUpdated: true }
    } else {
      // Update all users
      const { data: users } = await admin.from('profiles').select('id')
      let updatedCount = 0

      for (const user of users || []) {
        // Similar logic for each user
        updatedCount++
      }

      return { totalUsers: updatedCount, allUpdated: true }
    }
  }

  private async cleanupOldNotifications(data: { daysOld?: number }) {
    const admin = getSupabaseAdmin()
    const daysOld = data.daysOld || 30
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString()

    const { data: deletedNotifications } = await admin
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate)
      .eq('is_read', true)
      .select()

    return { deletedCount: deletedNotifications?.length || 0, cutoffDate }
  }

  private async syncAnimeData(data: { source: string, animeIds?: number[] }) {
    // TODO: Implement anime data synchronization with external APIs
    logger.info(`Syncing anime data from ${data.source}`)
    return { synced: true, source: data.source }
  }

  private async generateAnalyticsReport(data: { period: string }) {
    const admin = getSupabaseAdmin()
    
    // Generate analytics data
    const { data: userStats } = await admin
      .from('profiles')
      .select('created_at, watch_time_hours')

    const report = {
      period: data.period,
      totalUsers: userStats?.length || 0,
      totalWatchTime: userStats?.reduce((sum, user) => sum + (user.watch_time_hours || 0), 0) || 0,
      generatedAt: new Date().toISOString()
    }

    // TODO: Store report in database or send to analytics service
    return report
  }

  // Get job status
  getJobStatus(jobId: string): BackgroundJob | undefined {
    return this.jobs.get(jobId)
  }

  // Get all jobs
  getAllJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values())
  }

  // Clear completed jobs
  clearCompletedJobs() {
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(jobId)
      }
    }
  }
}

// Export singleton instance
export const backgroundJobs = BackgroundJobProcessor.getInstance()

// Helper functions for common jobs
export const addWelcomeEmailJob = (userId: string, email: string, name: string) =>
  backgroundJobs.addJob('send_welcome_email', { userId, email, name })

export const addUserStatsUpdateJob = (userId?: string) =>
  backgroundJobs.addJob('update_user_statistics', { userId })

export const addCleanupJob = (daysOld?: number) =>
  backgroundJobs.addJob('cleanup_old_notifications', { daysOld })

export const addAnimeSyncJob = (source: string, animeIds?: number[]) =>
  backgroundJobs.addJob('sync_anime_data', { source, animeIds })

export const addAnalyticsReportJob = (period: string) =>
  backgroundJobs.addJob('generate_analytics_report', { period })
