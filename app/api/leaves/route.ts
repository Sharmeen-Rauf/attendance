import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || searchParams.get('employee_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate') || searchParams.get('start_date');
    const endDate = searchParams.get('endDate') || searchParams.get('end_date');

    const db = await getDatabase();
    const andConditions: any[] = [];

    if (employeeId) {
      andConditions.push({
        $or: [
          { employeeId },
          { employee_id: employeeId }
        ]
      });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (startDate && endDate) {
      // Handle both field name formats for date range
      andConditions.push({
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { start_date: { $gte: startDate, $lte: endDate } }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const leaves = await db.collection('leave_records')
      .find(query)
      .sort({ createdAt: -1, created_at: -1, appliedAt: -1, applied_at: -1 })
      .toArray();

    return NextResponse.json({ leaves });
  } catch (error: any) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { employeeId, employeeName, leaveType, startDate, endDate, reason, days } = body;

    if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const leaveRecord = {
      id: randomUUID(),
      employee_id: employeeId,
      employee_name: employeeName,
      leave_type: leaveType, // 'sick', 'casual', 'annual', 'unpaid'
      start_date: startDate,
      end_date: endDate,
      days: days || 1,
      reason,
      status: 'pending', // 'pending', 'approved', 'rejected'
      applied_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection('leave_records').insertOne(leaveRecord);

    return NextResponse.json({ 
      message: 'Leave request submitted',
      id: result.insertedId 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating leave record:', error);
    return NextResponse.json(
      { error: 'Failed to create leave record' },
      { status: 500 }
    );
  }
}

