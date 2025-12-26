import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

// Email webhook endpoint - receives emails sent to hr@rightwaysolutions.ae
export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Parse email data (format depends on your email service provider)
    // This is a generic format - adjust based on your email service (Resend, SendGrid, etc.)
    const {
      from, // sender email
      subject,
      text, // email body
      html,
      date,
    } = body;

    if (!from || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      );
    }

    // Extract employee information from email
    const employeeInfo = await extractEmployeeFromEmail(from);
    if (!employeeInfo) {
      return NextResponse.json(
        { error: 'Employee not found for email: ' + from },
        { status: 400 }
      );
    }

    // Parse leave details from email subject and body
    const leaveDetails = parseLeaveRequest(subject, text, html);

    if (!leaveDetails) {
      return NextResponse.json(
        { error: 'Could not parse leave request from email' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Create leave record
    const leaveRecord = {
      _id: randomUUID(),
      employeeId: employeeInfo.id,
      employeeName: employeeInfo.name,
      employeeEmail: from,
      type: leaveDetails.type || 'Half Day',
      startDate: leaveDetails.startDate,
      endDate: leaveDetails.endDate || leaveDetails.startDate,
      reason: leaveDetails.reason || text.substring(0, 500), // Use email body as reason if not extracted
      status: 'pending',
      source: 'email', // Mark as email-based request
      emailSubject: subject,
      emailBody: text,
      appliedAt: new Date(date || new Date()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if similar leave request already exists (prevent duplicates)
    const existingLeave = await db.collection('leave_records').findOne({
      $and: [
        {
          $or: [
            { employeeId: employeeInfo.id },
            { employee_id: employeeInfo.id }
          ]
        },
        {
          $or: [
            { startDate: leaveDetails.startDate },
            { start_date: leaveDetails.startDate }
          ]
        },
        { status: 'pending' },
        { source: 'email' }
      ]
    });

    if (existingLeave) {
      return NextResponse.json({
        message: 'Leave request already exists',
        leaveId: existingLeave._id,
      }, { status: 200 });
    }

    // Insert leave record
    await db.collection('leave_records').insertOne(leaveRecord);

    // Create notification for user
    await db.collection('notifications').insertOne({
      _id: randomUUID(),
      employeeId: employeeInfo.id,
      employeeName: employeeInfo.name,
      type: 'leave_submitted',
      title: 'Leave Request Submitted',
      message: `Your ${leaveDetails.type || 'Half Day'} leave request for ${leaveDetails.startDate} has been received and is pending approval.`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: 'Leave request created successfully',
      leaveId: leaveRecord._id,
      employeeName: employeeInfo.name,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing email webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process email', details: error.message },
      { status: 500 }
    );
  }
}

// Extract employee information from sender email
async function extractEmployeeFromEmail(email: string): Promise<{ id: string; name: string } | null> {
  try {
    const db = await getDatabase();
    
    // First, try to find employee by exact email match
    const employee = await db.collection('employees').findOne({ email: email });
    if (employee) {
      return { id: employee.id, name: employee.name };
    }

    // If not found, try partial email match or check employee config
    // You might want to add email mapping logic here
    // For now, return null if not found
    return null;
  } catch (error) {
    console.error('Error extracting employee from email:', error);
    return null;
  }
}

// Parse leave request details from email subject and body
function parseLeaveRequest(subject: string, text: string, html?: string): {
  type?: string;
  startDate: string;
  endDate?: string;
  reason?: string;
} | null {
  // Extract date patterns (various formats)
  const datePatterns = [
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/g, // DD-MM-YYYY or DD/MM/YYYY
    /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g, // YYYY-MM-DD or YYYY/MM/DD
    /(today|tomorrow|next week|next month)/gi,
  ];

  // Extract half day / full day
  const halfDayPattern = /half[\s-]?day|halfday/gi;
  const isHalfDay = halfDayPattern.test(subject) || halfDayPattern.test(text);

  // Extract dates
  let startDate: string | null = null;
  let endDate: string | null = null;

  // Try to find dates in text
  const textToSearch = (html ? text + ' ' + html : text).toLowerCase();
  
  // Look for common date phrases
  if (textToSearch.includes('today')) {
    startDate = new Date().toISOString().split('T')[0];
  } else if (textToSearch.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    startDate = tomorrow.toISOString().split('T')[0];
  } else {
    // Try to extract date from patterns
    const dateMatches = text.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g);
    if (dateMatches && dateMatches.length > 0) {
      // Parse first date
      const firstDate = parseDate(dateMatches[0]);
      if (firstDate) {
        startDate = firstDate;
        
        // If second date exists, use as end date
        if (dateMatches.length > 1) {
          const secondDate = parseDate(dateMatches[1]);
          if (secondDate) {
            endDate = secondDate;
          }
        }
      }
    }
  }

  // If no date found, default to today
  if (!startDate) {
    startDate = new Date().toISOString().split('T')[0];
  }

  // Extract reason (text after common phrases)
  const reasonPatterns = [
    /reason[:\s]+(.+?)(?:\n|$)/i,
    /because[:\s]+(.+?)(?:\n|$)/i,
    /for[:\s]+(.+?)(?:\n|$)/i,
  ];

  let reason: string | undefined;
  for (const pattern of reasonPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      reason = match[1].trim().substring(0, 500);
      break;
    }
  }

  return {
    type: isHalfDay ? 'Half Day' : 'Full Day',
    startDate,
    endDate: endDate || undefined,
    reason: reason || undefined,
  };
}

// Parse date string to YYYY-MM-DD format
function parseDate(dateStr: string): string | null {
  try {
    // Handle DD-MM-YYYY or DD/MM/YYYY
    if (dateStr.includes('-') || dateStr.includes('/')) {
      const parts = dateStr.split(/[-\/]/);
      if (parts.length === 3) {
        let day, month, year;
        
        // Check if first part is year (YYYY-MM-DD)
        if (parts[0].length === 4) {
          year = parts[0];
          month = parts[1].padStart(2, '0');
          day = parts[2].padStart(2, '0');
        } else {
          // Assume DD-MM-YYYY
          day = parts[0].padStart(2, '0');
          month = parts[1].padStart(2, '0');
          year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        }
        
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  return null;
}

