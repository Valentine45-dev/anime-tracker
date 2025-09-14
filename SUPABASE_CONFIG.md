# Supabase Configuration Guide

## 🔧 Required Supabase Dashboard Settings

### 1. Authentication Settings

Go to **Authentication → URL Configuration** in your Supabase dashboard:

#### Site URL
```
http://localhost:3000
```

#### Redirect URLs (Add these)
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

### 2. Email Templates

Go to **Authentication → Email Templates** in your Supabase dashboard:

#### Confirm signup template
Update the **Confirm signup** template:

**Subject:**
```
Confirm your signup
```

**Body (HTML):**
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>If you didn't create an account, you can safely ignore this email.</p>
```

**Confirm URL (Direct Link - Prevents Browser Blocking):**
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}
```

**⚠️ Important**: Use the direct link format above instead of `{{ .ConfirmationURL }}` to prevent browser security blocks (like Firefox's "Can't Open This Page" error).

### 3. Email Settings

Go to **Authentication → Settings** in your Supabase dashboard:

#### Enable email confirmations
- ✅ **Enable email confirmations**: ON
- ✅ **Secure email change**: ON (optional)
- ✅ **Enable phone confirmations**: OFF (unless needed)

#### SMTP Settings (Optional)
If you want to use your own email service instead of Supabase's:

- **Host**: Your SMTP server
- **Port**: 587 (TLS) or 465 (SSL)
- **Username**: Your email username
- **Password**: Your email password
- **Sender name**: Your app name
- **Sender email**: Your email address

### 4. Row Level Security (RLS)

Make sure RLS is enabled on your tables:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

### 5. Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing Email Verification

1. **Sign up a new user** at `/auth/signup`
2. **Check email** for confirmation message
3. **Click confirmation link**
4. **Verify redirect** to `/auth/confirm` page
5. **Check auto-redirect** to login page
6. **Login with verified account**

## 📱 Mobile Testing

- Test on mobile device or use browser dev tools
- Verify email links work in mobile browsers
- Check responsive design on confirmation page

## 🚨 Troubleshooting

### Common Issues:

1. **Redirect not working**: Check URL configuration in Supabase dashboard
2. **Email not sending**: Check SMTP settings or use Supabase's default service
3. **Token invalid**: Check if confirmation URL template is correct
4. **RLS errors**: Ensure RLS policies are properly configured
5. **Browser blocking confirmation links**: Use direct URL format instead of `{{ .ConfirmationURL }}`
6. **Firefox "Can't Open This Page" error**: Use `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}`

### Debug Steps:

1. Check browser console for errors
2. Check Supabase dashboard logs
3. Verify environment variables
4. Test with different email providers
