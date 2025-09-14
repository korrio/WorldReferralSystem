# Deployment Guide for Render.com

This guide will help you deploy the World Referral System to Render.com.

## Prerequisites

1. A Render.com account (free tier available)
2. Your World ID App ID from [World ID Developer Portal](https://developer.worldcoin.org/)
3. Access to your GitHub repository

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all changes are committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render.com deployment"
   git push origin main
   ```

### Step 2: Deploy to Render.com

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Review the services that will be created:
   - **Web Service**: `world-referral-system`
   - **PostgreSQL Database**: `world-referral-db`

#### Option B: Manual Setup

If you prefer manual setup:

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `world-referral-db`
   - Plan: Starter (Free)
   - Click "Create Database"

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `world-referral-system`
     - **Environment**: `Node`
     - **Plan**: Starter (Free)
     - **Branch**: `main`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

### Step 3: Configure Environment Variables

In your web service settings, add these environment variables:

| Variable Name | Value | Notes |
|---------------|--------|-------|
| `NODE_ENV` | `production` | Set environment to production |
| `DATABASE_URL` | *Auto-generated* | Link to your PostgreSQL database |
| `SESSION_SECRET` | *Auto-generated* | Let Render generate a secure secret |
| `VITE_WORLD_ID_APP_ID` | `your-world-id-app-id` | Get from World ID Developer Portal |

**To link DATABASE_URL**:
1. In your web service → Environment
2. Add `DATABASE_URL` variable
3. Select "From Database" and choose your PostgreSQL database
4. Select "Connection String"

### Step 4: Set Up Database Schema

After your first deployment:

1. Go to your web service logs
2. Look for successful deployment
3. The database migrations should run automatically via Drizzle
4. If needed, you can run migrations manually via Render shell:
   ```bash
   npm run db:push
   ```

### Step 5: Configure World ID

1. Go to [World ID Developer Portal](https://developer.worldcoin.org/)
2. Update your app settings:
   - **Redirect URI**: `https://your-app-name.onrender.com/api/verify-world-id`
   - **App URL**: `https://your-app-name.onrender.com`

### Step 6: Test Your Deployment

1. Visit `https://your-app-name.onrender.com`
2. Test the health endpoint: `https://your-app-name.onrender.com/api/health`
3. Try the World ID registration flow
4. Verify database connections are working

## Important Notes

### Free Tier Limitations

- **Web Service**: Sleeps after 15 minutes of inactivity
- **Database**: 1GB storage limit, shared CPU
- **Bandwidth**: 100GB/month

### Production Considerations

- **Database Backups**: Set up automatic backups
- **Monitoring**: Enable Render's monitoring features  
- **Custom Domain**: Configure your own domain if needed
- **Environment Variables**: Keep sensitive data secure
- **SSL**: Automatic HTTPS on Render

### Troubleshooting

1. **Build Failures**: Check build logs in Render dashboard
2. **Database Connection**: Verify DATABASE_URL is correctly linked
3. **Environment Variables**: Ensure all required variables are set
4. **World ID Issues**: Check your World ID app configuration

### Scaling

To handle more traffic:
1. Upgrade to paid plans for better performance
2. Consider upgrading database plan for more storage
3. Enable auto-scaling if available

## Useful Commands

```bash
# View logs (if you have Render CLI)
render logs -s your-service-name

# Manual deployment
git push origin main  # Auto-deploys if connected to GitHub

# Database migrations
npm run db:push
```

## Support

- **Render Documentation**: https://render.com/docs
- **World ID Documentation**: https://docs.worldcoin.org/
- **Project Issues**: Check your GitHub repository issues

## Security Checklist

- [ ] `SESSION_SECRET` is strong and secure
- [ ] Database credentials are not exposed
- [ ] World ID app is configured for production URLs
- [ ] Environment variables are properly set
- [ ] HTTPS is enabled (automatic on Render)