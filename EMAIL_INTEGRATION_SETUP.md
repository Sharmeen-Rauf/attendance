# Email Integration Setup Guide

## Overview
This system allows employees to send leave requests via email to `hr@rightwaysolutions.ae`, which will automatically create leave records in the system.

## Email Webhook Endpoint
The webhook endpoint is located at: `/api/email/webhook`

## Setup Instructions

### Option 1: Using Resend (Recommended)
1. Sign up at [Resend.com](https://resend.com)
2. Create an API key
3. Set up email forwarding to your webhook URL:
   - In Resend dashboard, go to Inbound Email
   - Forward emails to: `https://yourdomain.com/api/email/webhook`
   - Set the destination email to `hr@rightwaysolutions.ae`

### Option 2: Using SendGrid
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Set up Inbound Parse Webhook
3. Point it to: `https://yourdomain.com/api/email/webhook`

### Option 3: Using Custom Email Server
You can set up email forwarding from your email server to call the webhook endpoint with the following payload format:

```json
{
  "from": "employee@company.com",
  "subject": "Leave Request - Half Day",
  "text": "I need a half day leave on 2024-12-26 for personal reasons.",
  "html": "<p>I need a half day leave on 2024-12-26 for personal reasons.</p>",
  "date": "2024-12-25T10:30:00Z"
}
```

## Email Format for Leave Requests

Employees should send emails in the following format:

**Subject:** Leave Request - Half Day / Full Day / [Leave Type]

**Body:** 
```
Date: [YYYY-MM-DD] or [DD-MM-YYYY]
Reason: [Reason for leave]
```

### Examples:

1. **Half Day Leave:**
   - Subject: "Leave Request - Half Day"
   - Body: "I need a half day leave on 26-12-2024 for personal work."

2. **Full Day Leave:**
   - Subject: "Leave Request - Full Day"
   - Body: "I need leave on 26-12-2024. Reason: Medical appointment."

3. **Multiple Days:**
   - Subject: "Leave Request"
   - Body: "I need leave from 26-12-2024 to 28-12-2024 for vacation."

## How It Works

1. Employee sends email to `hr@rightwaysolutions.ae`
2. Email service forwards email to webhook endpoint
3. System extracts:
   - Employee information from sender email
   - Leave type (Half Day/Full Day) from subject/body
   - Date(s) from email body
   - Reason from email body
4. Creates leave record in database with status "pending"
5. Creates notification for the employee
6. HR can see the leave request in the HR Dashboard
7. HR approves/rejects the request
8. Employee receives notification about approval/rejection

## Environment Variables

Add these to your `.env.local` or Vercel environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
# Email service credentials (if using direct SMTP)
EMAIL_SERVICE_API_KEY=your_api_key (optional)
```

## Testing the Webhook

You can test the webhook by sending a POST request:

```bash
curl -X POST https://yourdomain.com/api/email/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "employee@company.com",
    "subject": "Leave Request - Half Day",
    "text": "I need a half day leave on 2024-12-26 for personal reasons.",
    "date": "2024-12-25T10:30:00Z"
  }'
```

## Troubleshooting

1. **Employee not found error:**
   - Make sure the employee's email is registered in the system
   - Check the `employees` collection in MongoDB
   - The email in the database should match the sender's email

2. **Leave request not appearing:**
   - Check webhook logs
   - Verify email forwarding is set up correctly
   - Check MongoDB `leave_records` collection

3. **Date parsing issues:**
   - Ensure dates are in standard formats (YYYY-MM-DD, DD-MM-YYYY)
   - Use "today" or "tomorrow" for current/next day

## Security Considerations

1. Add authentication to the webhook endpoint
2. Validate email signatures if using email service
3. Rate limiting to prevent abuse
4. Log all webhook requests for auditing

