# Gmail API Setup Guide for AISC OTL System

## Quick Setup (5 minutes)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select Project" → "NEW PROJECT"
3. Name: "AISC OTL System" → Create

### Step 2: Enable Gmail API
1. In your project, go to "APIs & Services" → "Library"
2. Search "Gmail API" → Click → Enable

### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" → Create
3. Fill in:
   - App name: "AISC OTL Approval System"
   - User support email: your.email@aischennai.org
   - Developer contact: your.email@aischennai.org
4. Add Scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile` 
   - `.../auth/gmail.send`
5. Add test users (your AISC email addresses)

### Step 4: Create Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "OTL Web Client"
5. Authorized JavaScript origins: `http://localhost:3000`
6. Authorized redirect URIs: Leave blank
7. Create → Copy your Client ID

### Step 5: Configure OTL System
1. In OTL system, click "Update Connection Settings"
2. Paste your Google Client ID (ends in .apps.googleusercontent.com)
3. Save & Continue
4. Sign in with your AISC Gmail account
5. Grant permissions for Gmail sending

## Testing
1. Submit a new PL request
2. Check console for "✅ Email successfully sent" message
3. Supervisor should receive email notification

## Production Deployment
- Replace `http://localhost:3000` with your production URL
- Add all AISC staff emails as test users
- Publish app for organization use

## Troubleshooting
- **401 Error**: Re-authenticate with Gmail
- **Invalid Client ID**: Check Client ID format
- **Scope Missing**: Ensure all three scopes are added
- **No Email**: Check Gmail API is enabled
