# AniTrack Email Templates

## 📧 Enhanced Confirmation Email Template

Use this template in your Supabase Dashboard → Authentication → Email Templates → Confirm signup

### Subject Line:
```
Welcome to AniTrack! 🎌 Please confirm your email
```

### HTML Body:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AniTrack</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2d3748;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        }
        .features {
            background: #f7fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .features h3 {
            color: #2d3748;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 8px;
            color: #4a5568;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .security-note {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-note p {
            margin: 0;
            color: #234e52;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 20px;
            }
            .logo {
                width: 60px;
                height: 60px;
                font-size: 24px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">AT</div>
            <h1>Welcome to AniTrack! 🎌</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="welcome-text">
                <strong>Hi there! 👋</strong><br>
                Thank you for joining AniTrack! We're excited to have you as part of our anime-loving community.
            </p>

            <p>
                To get started and verify your account, please click the button below:
            </p>

            <div style="text-align: center;">
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}" class="cta-button">
                    ✨ Confirm Your Email ✨
                </a>
            </div>

            <div class="security-note">
                <p>
                    <strong>🔒 Security Note:</strong> This link will expire in 24 hours. 
                    If you didn't create an account, you can safely ignore this email.
                </p>
            </div>

            <!-- Features -->
            <div class="features">
                <h3>🎯 What you can do with AniTrack:</h3>
                <ul>
                    <li><strong>📺 Track Anime:</strong> Keep track of your favorite shows and episodes</li>
                    <li><strong>⭐ Rate & Review:</strong> Share your thoughts on anime you've watched</li>
                    <li><strong>👥 Join Communities:</strong> Connect with fellow anime fans</li>
                    <li><strong>📊 Analytics:</strong> View your watching statistics and progress</li>
                    <li><strong>🎨 Personal Lists:</strong> Create custom lists for different genres</li>
                    <li><strong>🔔 Notifications:</strong> Get updates on new episodes and releases</li>
                </ul>
            </div>

            <p>
                Once you confirm your email, you'll be able to:
            </p>
            <ul>
                <li>Access your personal anime dashboard</li>
                <li>Start building your watch list</li>
                <li>Join anime discussion communities</li>
                <li>Get personalized recommendations</li>
            </ul>

            <p style="margin-top: 30px;">
                <strong>Ready to dive into the world of anime? Let's get started! 🚀</strong>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>AniTrack</strong> - Your Ultimate Anime Tracking Companion<br>
                Made with ❤️ for anime enthusiasts worldwide
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">
                © 2024 AniTrack. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
```

### Plain Text Version (for email clients that don't support HTML):
```
Welcome to AniTrack! 🎌

Hi there! 👋

Thank you for joining AniTrack! We're excited to have you as part of our anime-loving community.

To get started and verify your account, please click the link below:

{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}

🔒 Security Note: This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.

🎯 What you can do with AniTrack:

📺 Track Anime: Keep track of your favorite shows and episodes
⭐ Rate & Review: Share your thoughts on anime you've watched
👥 Join Communities: Connect with fellow anime fans
📊 Analytics: View your watching statistics and progress
🎨 Personal Lists: Create custom lists for different genres
🔔 Notifications: Get updates on new episodes and releases

Once you confirm your email, you'll be able to:
• Access your personal anime dashboard
• Start building your watch list
• Join anime discussion communities
• Get personalized recommendations

Ready to dive into the world of anime? Let's get started! 🚀

---
AniTrack - Your Ultimate Anime Tracking Companion
Made with ❤️ for anime enthusiasts worldwide

© 2024 AniTrack. All rights reserved.
```

## 📱 Mobile-Optimized Features:

- ✅ **Responsive design** that works on all devices
- ✅ **Large touch targets** for mobile users
- ✅ **Optimized typography** for small screens
- ✅ **Professional branding** with your app colors
- ✅ **Clear call-to-action** button
- ✅ **Security messaging** to build trust
- ✅ **Feature highlights** to encourage engagement
- ✅ **Fallback plain text** for all email clients

## 🎨 Brand Colors Used:

- **Primary**: `#667eea` (Blue gradient)
- **Secondary**: `#764ba2` (Purple gradient)
- **Text**: `#2d3748` (Dark gray)
- **Background**: `#f8f9fa` (Light gray)
- **Accent**: `#38b2ac` (Teal for security notes)

This template will make your confirmation emails look professional and engaging, encouraging users to complete their registration and start using AniTrack!
