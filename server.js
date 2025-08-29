require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { google } = require('googleapis');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Gmail and Calendar setup
let oauth2Client;
let gmail;
let calendar;

async function initializeGoogleServices() {
  try {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    console.log('✅ Google services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Google services:', error);
  }
}

// Email processing function
async function processEmail(email) {
  try {
    const emailContent = extractEmailContent(email);
    console.log(`📧 Processing email: ${emailContent.subject}`);

    // Use OpenAI to analyze the email
    const analysis = await analyzeEmailWithAI(emailContent);
    
    if (analysis.events && analysis.events.length > 0) {
      for (const event of analysis.events) {
        await createCalendarEvent(event);
      }
    }

    if (analysis.tasks && analysis.tasks.length > 0) {
      for (const task of analysis.tasks) {
        await createTask(task);
      }
    }

    console.log(`✅ Successfully processed email: ${emailContent.subject}`);
  } catch (error) {
    console.error('❌ Error processing email:', error);
  }
}

function extractEmailContent(email) {
  const headers = email.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  const date = headers.find(h => h.name === 'Date')?.value || '';

  let body = '';
  
  if (email.payload.body && email.payload.body.data) {
    body = Buffer.from(email.payload.body.data, 'base64').toString();
  } else if (email.payload.parts) {
    for (const part of email.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString();
      }
    }
  }

  return { subject, from, date, body };
}

async function analyzeEmailWithAI(emailContent) {
  const prompt = `
Analyze this email and extract any calendar events and tasks. Respond with a JSON object.

Email Subject: ${emailContent.subject}
From: ${emailContent.from}
Date: ${emailContent.date}
Body: ${emailContent.body}

Please extract:
1. Events: meetings, appointments, social events, school events, etc.
2. Tasks: things that need to be done, assignments, deadlines, etc.

For events, include: title, description, start_date, start_time, end_date, end_time, location
For tasks, include: title, description, due_date, priority

Use ISO date format (YYYY-MM-DD) and 24-hour time format (HH:MM).
If specific times aren't mentioned, use reasonable defaults.
If dates are relative (like "next Friday"), calculate the actual date.

Return JSON in this format:
{
  "events": [
    {
      "title": "Event Title",
      "description": "Event Description",
      "start_date": "2024-01-15",
      "start_time": "15:00",
      "end_date": "2024-01-15", 
      "end_time": "16:00",
      "location": "Location if mentioned"
    }
  ],
  "tasks": [
    {
      "title": "Task Title",
      "description": "Task Description", 
      "due_date": "2024-01-20",
      "priority": "medium"
    }
  ]
}

If no events or tasks are found, return empty arrays.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting calendar events and tasks from emails. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing email with AI:', error);
    return { events: [], tasks: [] };
  }
}

async function createCalendarEvent(eventData) {
  try {
    const event = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location || '',
      start: {
        dateTime: `${eventData.start_date}T${eventData.start_time}:00`,
        timeZone: 'America/New_York', // Change to your timezone
      },
      end: {
        dateTime: `${eventData.end_date}T${eventData.end_time}:00`,
        timeZone: 'America/New_York', // Change to your timezone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log(`📅 Created calendar event: ${eventData.title}`);
    return result;
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
  }
}

async function createTask(taskData) {
  try {
    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
    
    // Get the default task list
    const taskLists = await tasks.tasklists.list();
    const defaultTaskList = taskLists.data.items[0].id;

    const task = {
      title: taskData.title,
      notes: taskData.description,
      due: taskData.due_date + 'T23:59:59.000Z' // End of day
    };

    const result = await tasks.tasks.insert({
      tasklist: defaultTaskList,
      resource: task
    });

    console.log(`✅ Created task: ${taskData.title}`);
    return result;
  } catch (error) {
    console.error('❌ Error creating task:', error);
  }
}

async function checkEmails() {
  try {
    if (!gmail) {
      console.log('⚠️  Gmail service not initialized yet');
      return;
    }

    console.log('🔍 Checking for new emails...');
    
    // Get emails from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const query = `after:${Math.floor(oneHourAgo.getTime() / 1000)}`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      console.log('📭 No new emails found');
      return;
    }

    console.log(`📬 Found ${response.data.messages.length} new emails`);

    for (const message of response.data.messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      await processEmail(email.data);
    }
  } catch (error) {
    console.error('❌ Error checking emails:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    services: {
      gmail: !!gmail,
      calendar: !!calendar,
      openai: !!process.env.OPENAI_API_KEY
    }
  });
});

app.post('/api/process-manual', async (req, res) => {
  try {
    await checkEmails();
    res.json({ success: true, message: 'Email processing triggered manually' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize services and start server
async function startServer() {
  await initializeGoogleServices();
  
  // Schedule email checking every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('⏰ Scheduled email check running...');
    checkEmails();
  });

  app.listen(PORT, () => {
    console.log(`🚀 Email automation server running on port ${PORT}`);
    console.log('📧 Checking emails every 15 minutes');
    
    // Run initial check
    setTimeout(() => {
      checkEmails();
    }, 5000);
  });
}

startServer();
