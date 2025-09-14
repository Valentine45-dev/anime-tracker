// Email configuration for admin system emails
import { getSupabaseAdmin } from './supabase'

export interface EmailConfig {
  fromEmail: string
  fromName: string
  replyTo?: string
}

// Configuration for admin emails
export const emailConfig: EmailConfig = {
  fromEmail: 'admin@anitrack.app', // Your admin email
  fromName: 'AniTrack Admin',
  replyTo: 'support@anitrack.app'
}

// Send email using Supabase's email service (requires service role key)
export async function sendAdminEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  try {
    const admin = getSupabaseAdmin()
    
    // Use Supabase's admin client to send emails
    // Note: This requires Supabase Pro plan or custom email service
    const { data, error } = await admin.functions.invoke('send-email', {
      body: {
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        from: emailConfig.fromEmail,
        from_name: emailConfig.fromName
      }
    })

    if (error) {
      console.error('Email sending error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Alternative: Use a third-party email service
export async function sendEmailViaService(
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  // Implementation for SendGrid, Resend, Nodemailer, etc.
  // This would require adding the respective packages and API keys
  
  console.log('Email would be sent:', {
    to,
    subject,
    from: emailConfig.fromEmail,
    html: htmlContent
  })
  
  return true // For development - replace with actual email sending
}
