// Email notification service for system emails
import { getSupabaseAdmin } from './supabase'
import { logger } from './logger'
import { emailConfig, sendEmailViaService } from './email-config'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface EmailJob {
  to: string
  template: string
  variables: Record<string, any>
  userId?: string
  priority: 'low' | 'normal' | 'high'
}

class EmailService {
  private templates: Map<string, EmailTemplate> = new Map()
  private emailQueue: EmailJob[] = []
  private isProcessing = false

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates() {
    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome to AniTrack',
      subject: 'Welcome to AniTrack! 🎉',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AniTrack!</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">Hi {{name}}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome to AniTrack, your ultimate anime tracking companion! We're excited to have you join our community of anime enthusiasts.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Here's what you can do:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>📺 Track your favorite anime and TV shows</li>
                <li>⭐ Rate and review anime</li>
                <li>👥 Join communities and discuss with fellow fans</li>
                <li>📊 Get personalized recommendations</li>
                <li>📈 Track your watching progress and statistics</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appUrl}}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Start Tracking Your Anime
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Happy watching!<br>
              The AniTrack Team
            </p>
          </div>
        </div>
      `,
      textContent: `
        Welcome to AniTrack!
        
        Hi {{name}}!
        
        Welcome to AniTrack, your ultimate anime tracking companion! We're excited to have you join our community of anime enthusiasts.
        
        Here's what you can do:
        - Track your favorite anime and TV shows
        - Rate and review anime
        - Join communities and discuss with fellow fans
        - Get personalized recommendations
        - Track your watching progress and statistics
        
        Start tracking your anime: {{appUrl}}/dashboard
        
        Happy watching!
        The AniTrack Team
      `,
      variables: ['name', 'appUrl']
    })

    // Password reset template
    this.templates.set('password_reset', {
      id: 'password_reset',
      name: 'Password Reset',
      subject: 'Reset Your AniTrack Password',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 30px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">Hi {{name}}!</h2>
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your AniTrack account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
        </div>
      `,
      textContent: `
        Password Reset Request
        
        Hi {{name}}!
        
        We received a request to reset your password for your AniTrack account.
        
        Reset your password: {{resetUrl}}
        
        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        
        This link will expire in 1 hour for security reasons.
      `,
      variables: ['name', 'resetUrl']
    })

    // New episode notification template
    this.templates.set('new_episode', {
      id: 'new_episode',
      name: 'New Episode Available',
      subject: 'New Episode: {{animeTitle}} Episode {{episodeNumber}}',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Episode Available! 🎉</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">{{animeTitle}}</h2>
            <p style="color: #666; line-height: 1.6;">
              Episode {{episodeNumber}} of {{animeTitle}} is now available!
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333; font-weight: bold;">Episode {{episodeNumber}}</p>
              <p style="margin: 5px 0 0 0; color: #666;">{{episodeTitle}}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{animeUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Watch Now
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">
              Happy watching!<br>
              AniTrack
            </p>
          </div>
        </div>
      `,
      textContent: `
        New Episode Available!
        
        {{animeTitle}} - Episode {{episodeNumber}}
        
        Episode {{episodeNumber}} of {{animeTitle}} is now available!
        
        {{episodeTitle}}
        
        Watch now: {{animeUrl}}
        
        Happy watching!
        AniTrack
      `,
      variables: ['animeTitle', 'episodeNumber', 'episodeTitle', 'animeUrl']
    })
  }

  // Send email using template
  async sendEmail(job: EmailJob): Promise<boolean> {
    try {
      const template = this.templates.get(job.template)
      if (!template) {
        throw new Error(`Template not found: ${job.template}`)
      }

      // Replace variables in template
      const processedSubject = this.replaceVariables(template.subject, job.variables)
      const processedHtml = this.replaceVariables(template.htmlContent, job.variables)
      const processedText = this.replaceVariables(template.textContent, job.variables)

      // Send email using configured email service
      const emailSent = await sendEmailViaService(
        job.to,
        processedSubject,
        processedHtml,
        processedText
      )

      if (!emailSent) {
        throw new Error('Failed to send email')
      }

      logger.info('Email sent successfully:', {
        to: job.to,
        subject: processedSubject,
        template: job.template,
        userId: job.userId
      })

      // Create notification in database
      if (job.userId) {
        const admin = getSupabaseAdmin()
        await admin.from('notifications').insert({
          user_id: job.userId,
          type: 'email_notification',
          title: processedSubject,
          message: processedText,
          data: {
            email: job.to,
            template: job.template,
            variables: job.variables
          },
          is_read: false
        } as any)
      }

      return true
    } catch (error) {
      logger.error('Failed to send email:', error as Record<string, any>)
      return false
    }
  }

  // Add email to queue
  async queueEmail(job: EmailJob): Promise<void> {
    this.emailQueue.push(job)
    logger.info('Email queued:', { template: job.template, to: job.to, priority: job.priority })

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEmailQueue()
    }
  }

  // Process email queue
  private async processEmailQueue(): Promise<void> {
    if (this.isProcessing) return

    this.isProcessing = true
    logger.info('Processing email queue')

    try {
      // Sort by priority
      this.emailQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      // Process emails
      for (const job of this.emailQueue) {
        await this.sendEmail(job)
      }

      // Clear processed emails
      this.emailQueue = []
    } catch (error) {
      logger.error('Error processing email queue:', error as Record<string, any>)
    } finally {
      this.isProcessing = false
    }
  }

  // Replace variables in template
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let processed = content
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value))
    }
    return processed
  }

  // Get available templates
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }

  // Get template by ID
  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id)
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Helper functions for common emails
export const sendWelcomeEmail = (email: string, name: string, userId: string) =>
  emailService.queueEmail({
    to: email,
    template: 'welcome',
    variables: { name, appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
    userId,
    priority: 'high'
  })

export const sendPasswordResetEmail = (email: string, name: string, resetUrl: string, userId: string) =>
  emailService.queueEmail({
    to: email,
    template: 'password_reset',
    variables: { name, resetUrl },
    userId,
    priority: 'high'
  })

export const sendNewEpisodeEmail = (email: string, animeTitle: string, episodeNumber: number, episodeTitle: string, animeUrl: string, userId: string) =>
  emailService.queueEmail({
    to: email,
    template: 'new_episode',
    variables: { animeTitle, episodeNumber, episodeTitle, animeUrl },
    userId,
    priority: 'normal'
  })
