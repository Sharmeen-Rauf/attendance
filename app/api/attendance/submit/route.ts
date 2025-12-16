import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { getEmployeeConfig, calculateStatus } from '@/lib/employeeConfig';

function calculateBreakDuration(breakInTime: Date | null, breakOutTime: Date | null): number | null {
  if (!breakInTime || !breakOutTime) return null;
  return Math.floor((new Date(breakOutTime).getTime() - new Date(breakInTime).getTime()) / 1000);
}

function validateBreakDuration(breakDurationSeconds: number, config: any): boolean {
  const maxBreakSeconds = config.maxBreakDurationMinutes * 60;
  return breakDurationSeconds <= maxBreakSeconds;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI environment variable.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { employeeId, employeeName, action, timestamp } = body;

    if (!employeeId || !employeeName || !action || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get employee configuration
    const employeeConfig = getEmployeeConfig(employeeId);
    if (!employeeConfig) {
      return NextResponse.json(
        { error: 'Employee configuration not found' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const timestampDate = new Date(timestamp);
    // Use UTC date to ensure consistency
    const today = timestampDate.toISOString().split('T')[0];

    // Get or create today's attendance record
    const existingRecord = await db.collection('attendance_records').findOne({
      employee_id: employeeId,
      date: today
    });

    let record: any;

    if (existingRecord) {
      record = existingRecord;
    } else {
      record = {
        id: randomUUID(),
        employee_id: employeeId,
        employee_name: employeeName,
        date: today,
        check_in_time: null,
        check_out_time: null,
        break_in_time: null,
        break_out_time: null,
        status: 'on_time',
        break_duration: null,
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    // Update record based on action
    if (action === 'checkin') {
      if (record.check_in_time) {
        return NextResponse.json(
          { error: 'Already checked in today' },
          { status: 400 }
        );
      }
      record.check_in_time = timestampDate;
      record.status = calculateStatus(timestampDate, employeeConfig);
    } else if (action === 'checkout') {
      if (!record.check_in_time) {
        return NextResponse.json(
          { error: 'Please check in first' },
          { status: 400 }
        );
      }
      if (record.check_out_time) {
        return NextResponse.json(
          { error: 'Already checked out today' },
          { status: 400 }
        );
      }
      if (record.break_in_time && !record.break_out_time) {
        return NextResponse.json(
          { error: 'Please complete break first' },
          { status: 400 }
        );
      }
      record.check_out_time = timestampDate;
    } else if (action === 'breakin') {
      if (!record.check_in_time) {
        return NextResponse.json(
          { error: 'Please check in first' },
          { status: 400 }
        );
      }
      if (record.break_in_time) {
        return NextResponse.json(
          { error: 'Break already started' },
          { status: 400 }
        );
      }
      if (record.break_out_time) {
        return NextResponse.json(
          { error: 'Only one break allowed per day' },
          { status: 400 }
        );
      }
      record.break_in_time = timestampDate;
    } else if (action === 'breakout') {
      if (!record.break_in_time) {
        return NextResponse.json(
          { error: 'Break not started' },
          { status: 400 }
        );
      }
      if (record.break_out_time) {
        return NextResponse.json(
          { error: 'Break already completed' },
          { status: 400 }
        );
      }
      record.break_out_time = timestampDate;
      record.break_duration = calculateBreakDuration(record.break_in_time, record.break_out_time);
      
      // Validate break duration
      if (record.break_duration && !validateBreakDuration(record.break_duration, employeeConfig)) {
        // Still save but will be flagged in reports
        console.warn(`Break duration ${record.break_duration}s exceeds max ${employeeConfig.maxBreakDurationMinutes * 60}s for ${employeeName}`);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    record.updated_at = new Date();

    // Save record
    if (existingRecord) {
      const updateResult = await db.collection('attendance_records').updateOne(
        { _id: existingRecord._id },
        { $set: record }
      );
      if (updateResult.modifiedCount === 0) {
        console.warn('No record was modified during update');
      }
    } else {
      const insertResult = await db.collection('attendance_records').insertOne(record);
      record._id = insertResult.insertedId;
    }

    // Return formatted response
    return NextResponse.json({
      id: record.id,
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      date: record.date,
      checkInTime: record.check_in_time ? new Date(record.check_in_time).toISOString() : null,
      checkOutTime: record.check_out_time ? new Date(record.check_out_time).toISOString() : null,
      breakInTime: record.break_in_time ? new Date(record.break_in_time).toISOString() : null,
      breakOutTime: record.break_out_time ? new Date(record.break_out_time).toISOString() : null,
      status: record.status,
      breakDuration: record.break_duration,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting attendance:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to submit attendance';
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

