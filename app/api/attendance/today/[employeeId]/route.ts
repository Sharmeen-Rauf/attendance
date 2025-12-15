import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEmployeeConfig } from '@/lib/employeeConfig';

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI environment variable.' },
        { status: 500 }
      );
    }

    const { employeeId } = params;
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const record = await db.collection('attendance_records').findOne({
      employee_id: employeeId,
      date: today
    });

    const config = getEmployeeConfig(employeeId);
    
    if (!record) {
      return NextResponse.json({
        checkInTime: null,
        checkOutTime: null,
        breakInTime: null,
        breakOutTime: null,
        status: null,
        officeStartTime: config?.officeStartTime || '09:00',
        officeEndTime: config?.officeEndTime || '17:00',
        flexibleStart: config?.flexibleStart || false,
      });
    }

    return NextResponse.json({
      checkInTime: record.check_in_time ? new Date(record.check_in_time).toISOString() : null,
      checkOutTime: record.check_out_time ? new Date(record.check_out_time).toISOString() : null,
      breakInTime: record.break_in_time ? new Date(record.break_in_time).toISOString() : null,
      breakOutTime: record.break_out_time ? new Date(record.break_out_time).toISOString() : null,
      status: record.status || 'on_time',
      officeStartTime: config?.officeStartTime || '09:00',
      officeEndTime: config?.officeEndTime || '17:00',
      flexibleStart: config?.flexibleStart || false,
    });
  } catch (error: any) {
    console.error('Error fetching today status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today status' },
      { status: 500 }
    );
  }
}

