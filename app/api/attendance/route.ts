import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI environment variable.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const filterDate = searchParams.get('date');
    const filterStatus = searchParams.get('status');

    const db = await getDatabase();
    let query: any = {};

    if (employeeId) {
      query.employee_id = employeeId;
    }

    if (filterDate) {
      query.date = filterDate;
    }

    if (filterStatus) {
      query.status = filterStatus;
    }

    const records = await db.collection('attendance_records')
      .find(query)
      .sort({ date: -1, check_in_time: -1 })
      .toArray();

    const formattedRecords = records.map((record: any) => ({
      id: record.id || record._id,
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      date: record.date,
      checkInTime: record.check_in_time ? new Date(record.check_in_time).toISOString() : null,
      checkOutTime: record.check_out_time ? new Date(record.check_out_time).toISOString() : null,
      breakInTime: record.break_in_time ? new Date(record.break_in_time).toISOString() : null,
      breakOutTime: record.break_out_time ? new Date(record.break_out_time).toISOString() : null,
      status: record.status,
      breakDuration: record.break_duration,
      createdAt: record.created_at ? new Date(record.created_at).toISOString() : null,
      updatedAt: record.updated_at ? new Date(record.updated_at).toISOString() : null,
    }));

    return NextResponse.json(formattedRecords);
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

