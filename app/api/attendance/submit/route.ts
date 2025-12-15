import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

const OFFICE_START_TIME = '09:00:00';
const GRACE_PERIOD_MINUTES = 10;
const MAX_BREAK_DURATION_MINUTES = 30;

function calculateStatus(checkInTime: Date): string {
  const checkIn = new Date(checkInTime);
  const officeTime = new Date(checkIn);
  const [hours, minutes] = OFFICE_START_TIME.split(':').map(Number);
  officeTime.setHours(hours, minutes, 0, 0);
  
  const graceEnd = new Date(officeTime);
  graceEnd.setMinutes(graceEnd.getMinutes() + GRACE_PERIOD_MINUTES);
  
  if (checkIn <= officeTime) {
    return 'on_time';
  } else if (checkIn <= graceEnd) {
    return 'grace';
  } else {
    return 'late';
  }
}

function calculateBreakDuration(breakInTime: Date | null, breakOutTime: Date | null): number | null {
  if (!breakInTime || !breakOutTime) return null;
  return Math.floor((new Date(breakOutTime).getTime() - new Date(breakInTime).getTime()) / 1000);
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

    const db = await getDatabase();
    const timestampDate = new Date(timestamp);
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
      record.status = calculateStatus(timestampDate);
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
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    record.updated_at = new Date();

    // Save record
    if (existingRecord) {
      await db.collection('attendance_records').updateOne(
        { _id: existingRecord._id },
        { $set: record }
      );
    } else {
      await db.collection('attendance_records').insertOne(record);
    }

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting attendance:', error);
    return NextResponse.json(
      { error: 'Failed to submit attendance' },
      { status: 500 }
    );
  }
}

