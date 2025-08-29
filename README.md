# 📧 Email Automation App

Automatically create calendar events and tasks from your emails using AI! This app monitors your Gmail inbox and intelligently extracts events and tasks, adding them to Google Calendar and Google Tasks.

## ✨ Features

- **🤖 AI-Powered Email Analysis**: Uses OpenAI to understand email content
- **📅 Automatic Calendar Events**: Creates events for meetings, appointments, school events, etc.
- **✅ Task Management**: Extracts tasks with due dates from emails
- **⏰ Automated Monitoring**: Checks emails every 15 minutes
- **🎯 Smart Parsing**: Handles relative dates like "next Friday" or "tomorrow"
- **🔔 Reminders**: Sets up email and popup reminders for events

## 🚀 Quick Deployment Guide

### Step 1: Get Your Files Ready

1. Create a new folder on your computer called `email-automation`
2. Download all the files from this repository into that folder
3. Create a `.env` file by copying `.env.example` and renaming it to `.env`

### Step 2: Set Up Required Services (All Free!)

#### A. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/login and go to API Keys
3. Create a new API key
4. Copy it to your `.env` file: `OPENAI_API_KEY=your_key_here`

#### B. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable these APIs:
   - Gmail API
   - Google Calendar API  
   - Google Tasks API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application Type to "Web Application"
6. Add these redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-app-name.up.railway.app/auth/callback` (replace with your Railway URL)
7. Copy the Client ID and Client Secret to your `.env` file

### Step 3: Get Google Refresh Token

1. Fill in your Google credentials in the `.env` file
2. Open terminal/command prompt in your project folder
3. Run: `npm install`
4. Run: `node auth-helper.js`
5. Follow the instructions to authorize your app
6. Copy the refresh token to your `.env` file

### Step 4: Deploy to Railway (Free!)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account and select your repository
5. Railway will automatically deploy your app!

#### Setting Environment Variables in Railway:
1. In your Railway project, go to "Variables" tab
2. Add all your environment variables from the `.env` file:
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_REFRESH_TOKEN`

### Step 5: Alternative Deployment Options

#### Option A: Render (Also Free!)
1. Go to [Render](https://render.com)
2. Sign up and connect GitHub
3. Create "New Web Service"
4. Select your repository
5. Add environment variables in the dashboard

#### Option B: Heroku (Has free tier)
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Run these commands:
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GOOGLE_CLIENT_ID=your_id
# ... add all other env vars
git push heroku main
```

## 🔧 Configuration

### Environment Variables (.env file)
```bash
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Required: Google OAuth Credentials  
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here

# Optional: Server Configuration
PORT=3000
```

### Customize Time Zone
Edit `server.js` and change the timezone in the `createCalendarEvent` function:
```javascript
timeZone: 'America/New_York', // Change to your timezone
```

Common timezones:
- `America/New_York` (Eastern)
- `America/Chicago` (Central) 
- `America/Denver` (Mountain)
- `America/Los_Angeles` (Pacific)
- `Europe/London` (GMT)
- `Europe/Paris` (CET)

## 📱 How to Use

1. **Forward emails**: Forward any email to your Gmail address (the one you set up)
2. **Send directly**: Email directly to your Gmail address
3. **Monitor dashboard**: Visit your deployed app URL to see the dashboard
4. **Check status**: The dashboard shows if all services are connected
5. **Manual processing**: Use the "Process Emails Now" button for immediate processing

## 🎯 What Emails Get Processed

The app looks for:

### 📅 Events
- School events: "Ice cream social Friday at 3pm"
- Meetings: "Team meeting tomorrow at 10am"
- Appointments: "Doctor appointment next Tuesday 2:30pm"
- Social events: "Birthday party this Saturday"

### ✅ Tasks  
- Assignments: "Bring paper drawing by next Friday"
- Deadlines: "Submit report by end of week"
- Reminders: "Don't forget to call John tomorrow"
- To-dos: "Pick up groceries this evening"

## 🔍 Monitoring & Logs

- **Dashboard**: Visit your app URL to see real-time status
- **Automatic checks**: Runs every 15 minutes
- **Manual trigger**: Use the dashboard button for immediate processing
- **Logs**: Check the dashboard for processing logs and errors

## 🛠️ Troubleshooting

### Common Issues:

**"Gmail service not initialized"**
- Check your Google OAuth credentials
- Make sure you completed the auth-helper.js step
- Verify all APIs are enabled in Google Cloud Console

**"OpenAI API error"**  
- Verify your OpenAI API key is correct
- Check you have credits in your OpenAI account
- Make sure the key has proper permissions

**"No events/tasks created"**
- Check if emails contain clear date/time information
- Try forwarding a test email with obvious event info
- Check the dashboard logs for AI analysis results

**Deployment issues**
- Make sure all environment variables are set correctly
- Check the deployment logs in Railway/Render
- Verify your app is using Node.js 18.x

## 📊 Free Tier Limits

- **Railway**: 500 hours/month (plenty for this app)
- **OpenAI**: $5 free credit (thousands of email analyses)
- **Google APIs**: Very generous free quotas
- **Render**: 750 hours/month free

## 🔒 Security Notes

- Never commit your `.env` file to Git
- Keep your API keys and tokens secure
- The app only reads your emails, doesn't send or modify them
- All processing happens on your authorized Google account

## 🚨 Important Setup Reminder

1. ✅ Get OpenAI API key
2. ✅ Create Google Cloud project and enable APIs
3. ✅ Set up OAuth credentials  
4. ✅ Run auth-helper.js to get refresh token
5. ✅ Deploy to Railway/Render
6. ✅ Set all environment variables
7. ✅ Test with the dashboard

## 🆘 Need Help?

1. Check the dashboard for error messages
2. Look at your deployment platform's logs
3. Verify all environment variables are set correctly
4. Test each service individually using the dashboard
5. Make sure you completed the Google OAuth setup

Your email automation app will be running 24/7, automatically creating events and tasks from your emails! 🎉
