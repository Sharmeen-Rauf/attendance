import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEmployeeConfig } from '@/lib/employeeConfig';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const session = await db.collection('sessions').findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const employee = await db.collection('employees').findOne({
      id: session.employeeId
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const config = getEmployeeConfig(session.employeeId);

    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        officeStartTime: config?.officeStartTime || '09:00',
        officeEndTime: config?.officeEndTime || '17:00',
        flexibleStart: config?.flexibleStart || false,
      }
    });
  } catch (error: any) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

