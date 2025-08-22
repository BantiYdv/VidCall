# Deployment Guide

This guide will help you deploy the Doctor-Patient Video Call application to various platforms.

## Prerequisites

1. **Agora.io Account**: Sign up at [Agora.io](https://www.agora.io/) and get your App ID and App Certificate
2. **Git Repository**: Push your code to a Git repository (GitHub, GitLab, etc.)

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

## Deployment Options

### Option 1: Render (Recommended)

1. **Sign up** at [Render.com](https://render.com/)
2. **Connect your repository** to Render
3. **Create a new Web Service**
4. **Configure the service**:
   - **Name**: `doctor-patient-videocall`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all`
   - **Start Command**: `npm run start:deploy`
   - **Root Directory**: Leave empty (root of repository)

5. **Add Environment Variables** in Render dashboard:
   - `JWT_SECRET`: Your JWT secret key
   - `AGORA_APP_ID`: Your Agora App ID
   - `AGORA_APP_CERTIFICATE`: Your Agora App Certificate
   - `CLIENT_URL`: Your Render app URL (e.g., `https://your-app.onrender.com`)

6. **Deploy** and wait for the build to complete

### Option 2: Heroku

1. **Install Heroku CLI** and login
2. **Create a new Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set AGORA_APP_ID=your-agora-app-id
   heroku config:set AGORA_APP_CERTIFICATE=your-agora-certificate
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 3: Railway

1. **Sign up** at [Railway.app](https://railway.app/)
2. **Connect your repository**
3. **Create a new service** from your repository
4. **Add environment variables** in Railway dashboard
5. **Deploy** automatically

### Option 4: DigitalOcean App Platform

1. **Sign up** at [DigitalOcean](https://www.digitalocean.com/)
2. **Create a new App** from your repository
3. **Configure**:
   - **Build Command**: `npm run install-all`
   - **Run Command**: `npm run start:deploy`
4. **Add environment variables**
5. **Deploy**

## Platform-Specific Notes

### Render
- Uses `npm run start:deploy` which builds the React app and starts the server
- Automatically serves the built React app from the Express server
- Supports WebSocket connections for real-time features

### Vercel
- Better suited for frontend-only deployments
- For full-stack, consider using Vercel Functions for the API

### Netlify
- Frontend-focused platform
- Consider using Netlify Functions for API endpoints

## Troubleshooting

### Common Issues

1. **"concurrently: not found"**
   - Solution: Use `npm run start:deploy` instead of `npm start`
   - Or ensure `concurrently` is in `dependencies` (not `devDependencies`)

2. **Build fails**
   - Check that all dependencies are properly installed
   - Ensure Node.js version is 16+ (specified in `engines` field)

3. **Environment variables not working**
   - Double-check variable names and values
   - Restart the deployment after adding variables

4. **WebSocket connection issues**
   - Ensure your platform supports WebSocket connections
   - Check CORS settings in production

### Environment Variable Checklist

- [ ] `JWT_SECRET` - A secure random string for JWT signing
- [ ] `AGORA_APP_ID` - Your Agora.io App ID
- [ ] `AGORA_APP_CERTIFICATE` - Your Agora.io App Certificate
- [ ] `CLIENT_URL` - Your production app URL
- [ ] `PORT` - Port number (usually auto-set by platform)

## Testing After Deployment

1. **Visit your app URL**
2. **Register/Login** with test accounts
3. **Test video calls** between different browsers/devices
4. **Check console** for any errors
5. **Verify WebSocket connections** are working

## Security Considerations

1. **Use HTTPS** in production
2. **Set strong JWT secrets**
3. **Keep Agora credentials secure**
4. **Enable rate limiting** (already configured)
5. **Use environment variables** for all sensitive data

## Support

If you encounter issues:
1. Check the platform's deployment logs
2. Verify all environment variables are set
3. Test locally with production environment variables
4. Check the browser console for client-side errors
