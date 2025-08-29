require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// This script helps you get the Google refresh token
// Run this ONCE during setup: node auth-helper.js

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks'
];

function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  console.log('\n🔐 GOOGLE OAUTH SETUP');
  console.log('='.repeat(50));
  console.log('\n1. Open this URL in your browser:');
  console.log(authUrl);
  console.log('\n2. Complete the authorization flow');
  console.log('3. Copy the authorization code from the redirect URL');
  console.log('4. Paste it below when prompted\n');
  
  return authUrl;
}

async function getTokens(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ SUCCESS! Here are your tokens:');
    console.log('='.repeat(50));
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n📝 Add this to your .env file!');
    console.log('\n⚠️  IMPORTANT: Keep this refresh token secure and private!');
    
    return tokens;
  } catch (error) {
    console.error('❌ Error getting tokens:', error);
    return null;
  }
}

async function main() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Missing Google OAuth credentials in .env file');
    console.log('\nPlease set up:');
    console.log('- GOOGLE_CLIENT_ID');
    console.log('- GOOGLE_CLIENT_SECRET');
    console.log('- GOOGLE_REDIRECT_URI');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('🚀 Starting Google OAuth setup...\n');
  
  // Generate and display auth URL
  getAuthUrl();

  rl.question('Enter the authorization code: ', async (code) => {
    if (!code) {
      console.log('❌ No code provided. Exiting...');
      rl.close();
      return;
    }

    console.log('\n🔄 Exchanging code for tokens...');
    const tokens = await getTokens(code);
    
    if (tokens) {
      console.log('\n🎉 Setup complete!');
      console.log('Your app is now ready to access Gmail, Calendar, and Tasks.');
    } else {
      console.log('\n💥 Setup failed. Please try again.');
    }
    
    rl.close();
  });
}

if (require.main === module) {
  main().catch(console.error);
}
