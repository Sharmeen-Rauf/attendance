import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEmployeeConfig } from '@/lib/employeeConfig';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get employee config first
    const config = getEmployeeConfig(employeeId);
    if (!config) {
      return NextResponse.json(
        { error: 'Employee configuration not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    // Check if employee exists, if not create it
    let employee: any = await db.collection('employees').findOne({
      id: employeeId
    });

    if (!employee) {
      // Auto-create employee from config
      const newEmployee = {
        id: employeeId,
        name: config.name,
        email: null,
        created_at: new Date()
      };
      await db.collection('employees').insertOne(newEmployee);
      employee = await db.collection('employees').findOne({
        id: employeeId
      });
    }

    // Create session token
    const sessionToken = randomUUID();
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hour session

    // Store session
    await db.collection('sessions').insertOne({
      token: sessionToken,
      employeeId: employeeId,
      employeeName: employee.name,
      expiresAt: sessionExpiry,
      createdAt: new Date()
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        officeStartTime: config.officeStartTime,
        officeEndTime: config.officeEndTime,
        flexibleStart: config.flexibleStart,
      }
    });

    // Set HTTP-only cookie for security
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

