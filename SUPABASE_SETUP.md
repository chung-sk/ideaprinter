# Supabase Setup Guide for IdeaPrinter

This guide will help you set up Supabase authentication and enable the subscription features in IdeaPrinter.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- This IdeaPrinter codebase

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: ideaprinter (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for your project to be set up (this takes ~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys") - ⚠️ Keep this secret!

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Update the Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace the placeholder values with your actual Supabase credentials from Step 2.

## Step 4: Enable Authentication Providers

### Email/Password Authentication (Already Enabled)

Email/password authentication is enabled by default in Supabase.

### Google OAuth (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Toggle "Enable Sign in with Google" to ON
4. Follow the instructions to:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
5. Copy your Google Client ID and Client Secret
6. Paste them in the Supabase Google provider settings
7. Click "Save"

### GitHub OAuth (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** in the list and click to expand
3. Toggle "Enable Sign in with GitHub" to ON
4. Go to GitHub → Settings → Developer settings → OAuth Apps
5. Click "New OAuth App"
6. Fill in:
   - **Application name**: IdeaPrinter
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
7. Click "Register application"
8. Copy your Client ID and generate a Client Secret
9. Paste them in the Supabase GitHub provider settings
10. Click "Save"

## Step 5: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 6: Set Up Database Tables for Subscriptions (Future Enhancement)

For now, the app uses Supabase only for authentication. To add subscription tracking, you can create these tables:

```sql
-- Create subscriptions table
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan_name text not null,
  status text not null default 'active',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table subscriptions enable row level security;

-- Create policies
create policy "Users can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);
```

Run this SQL in **SQL Editor** in your Supabase dashboard.

## Step 7: Test the Authentication

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/subscribe`
3. Click "Sign Up" or "Get Started"
4. Try creating an account with email/password
5. Check your email for the confirmation link
6. Try signing in with Google or GitHub (if configured)

## Step 8: Deploy to Production

### Update Vercel Environment Variables

If deploying to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (if not already added)
   - `SESSION_SECRET`

4. Redeploy your application

### Update OAuth Redirect URLs

For each OAuth provider (Google, GitHub), add your production URLs:
- `https://your-domain.com/auth/callback`
- `https://your-project-id.supabase.co/auth/v1/callback`

## Troubleshooting

### "Invalid API key" or "Project not found"

- Double-check your environment variables
- Ensure you're using the correct project URL and keys
- Restart your development server after changing environment variables

### OAuth not working

- Verify redirect URLs are correctly configured in both the OAuth provider and Supabase
- Check that the provider is enabled in Supabase dashboard
- Make sure client ID and secret are correctly entered

### Email confirmation not received

- Check your spam folder
- Verify email settings in Supabase dashboard
- For development, you can disable email confirmation in **Authentication** → **Providers** → **Email** → Uncheck "Confirm email"

## Next Steps

1. **Add Payment Integration**: Integrate Stripe or another payment provider for actual subscriptions
2. **Sync User Data**: Store generated ideas in Supabase for cloud sync
3. **Add Usage Limits**: Implement rate limiting based on subscription tier
4. **Analytics Dashboard**: Track user engagement and subscription metrics

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

If you encounter issues:
1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review the [Next.js + Supabase examples](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
3. Open an issue in the IdeaPrinter repository
