import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// AI Agent "Aira" - HR Assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, employeeId, employeeName, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process the message with Aira AI agent
    const response = await processAiraMessage(message, { employeeId, employeeName, context });

    // Save chat history
    if (employeeId) {
      try {
        const db = await getDatabase();
        await db.collection('ai_chat_history').insertOne({
          employee_id: employeeId,
          employee_name: employeeName || null,
          message,
          response: response.message,
          context: response.context || null,
          created_at: new Date(),
        });
      } catch (error) {
        console.error('Error saving chat history:', error);
        // Don't fail the request if history save fails
      }
    }

    return NextResponse.json({
      message: response.message,
      suggestions: response.suggestions || [],
      context: response.context,
    });
  } catch (error: any) {
    console.error('Error processing AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}

async function processAiraMessage(
  message: string,
  metadata: { employeeId?: string; employeeName?: string; context?: any }
): Promise<{ message: string; suggestions?: string[]; context?: any }> {
  const lowerMessage = message.toLowerCase().trim();
  
  // HR-related queries
  if (lowerMessage.includes('attendance') || lowerMessage.includes('check in') || lowerMessage.includes('check out')) {
    return {
      message: `I can help you with attendance-related questions. You can mark your attendance, view your attendance history, or check your current status. Would you like to: 1) Mark attendance, 2) View attendance records, or 3) Check your attendance status?`,
      suggestions: ['Mark attendance', 'View my attendance', 'Check my status'],
    };
  }

  if (lowerMessage.includes('leave') || lowerMessage.includes('holiday') || lowerMessage.includes('vacation')) {
    return {
      message: `I can help you with leave management. You can apply for leave, check your leave balance, or view leave policies. What would you like to do?`,
      suggestions: ['Apply for leave', 'Check leave balance', 'View leave policies'],
    };
  }

  if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
    return {
      message: `For payroll and salary information, I can help you understand your pay structure, view payslips, or check deductions. Please note that detailed payroll information may require admin access.`,
      suggestions: ['View my payslips', 'Check salary details', 'Payroll policies'],
    };
  }

  if (lowerMessage.includes('employee') || lowerMessage.includes('staff') || lowerMessage.includes('colleague')) {
    return {
      message: `I can help you find employee information, contact details, or department information. However, access to employee data may be restricted based on your permissions.`,
    };
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('features')) {
    return {
      message: `Hi! I'm Aira, your HR assistant. I can help you with:\n\n• Attendance management (check-in, check-out, view records)\n• Leave management (apply for leave, check balance)\n• Payroll queries (salary information, payslips)\n• Employee information\n• HR policies and guidelines\n\nWhat would you like to know?`,
      suggestions: ['Attendance help', 'Leave management', 'Payroll questions', 'HR policies'],
    };
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: `Hello! I'm Aira, your HR assistant. How can I help you today? You can ask me about attendance, leaves, payroll, or any HR-related questions.`,
      suggestions: ['Attendance', 'Leave application', 'Payroll', 'Help'],
    };
  }

  if (lowerMessage.includes('hours') || lowerMessage.includes('work time') || lowerMessage.includes('office hours')) {
    return {
      message: `Your office hours depend on your employee configuration. I can check your specific office hours if you'd like. Generally, office hours are set by your department and may vary. Would you like me to check your specific office hours?`,
      suggestions: ['Check my office hours', 'View work schedule'],
    };
  }

  if (lowerMessage.includes('break') || lowerMessage.includes('lunch')) {
    return {
      message: `For break times, you can mark break-in and break-out in the attendance system. Break durations are tracked automatically. You can take breaks as per your company policy.`,
      suggestions: ['Mark break', 'Break policies'],
    };
  }

  // Default response for unrecognized queries
  return {
    message: `I understand you're asking about "${message}". I'm Aira, your HR assistant, and I specialize in helping with:\n\n• Attendance and time tracking\n• Leave management\n• Payroll and compensation\n• Employee information\n• HR policies\n\nCould you rephrase your question, or would you like help with any of these topics?`,
    suggestions: ['Attendance', 'Leave', 'Payroll', 'Help'],
  };
}

// Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const history = await db.collection('ai_chat_history')
      .find({ employee_id: employeeId })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

