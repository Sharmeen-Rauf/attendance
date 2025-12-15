import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { EMPLOYEE_CONFIGS } from '@/lib/employeeConfig';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Get all employees
    const employees = await db.collection('employees').find({}).toArray();
    
    // Get today's attendance for all employees
    const attendanceRecords = await db.collection('attendance_records')
      .find({ date: today })
      .toArray();

    // Create a map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach((record: any) => {
      attendanceMap.set(record.employee_id, record);
    });

    // Build status for each employee
    const statusList = employees.map((emp: any) => {
      const record = attendanceMap.get(emp.id);
      const config = EMPLOYEE_CONFIGS[emp.id];
      
      const status: any = {
        employeeId: emp.id,
        employeeName: emp.name,
        isCheckedIn: !!record?.check_in_time,
        isCheckedOut: !!record?.check_out_time,
        isOnBreak: !!(record?.break_in_time && !record?.break_out_time),
        checkInTime: record?.check_in_time ? new Date(record.check_in_time).toISOString() : null,
        checkOutTime: record?.check_out_time ? new Date(record.check_out_time).toISOString() : null,
        breakInTime: record?.break_in_time ? new Date(record.break_in_time).toISOString() : null,
        breakOutTime: record?.break_out_time ? new Date(record.break_out_time).toISOString() : null,
        status: record?.status || 'not_checked_in',
        officeStartTime: config?.officeStartTime || '09:00',
        officeEndTime: config?.officeEndTime || '17:00',
      };

      return status;
    });

    // Separate into categories
    const checkedIn = statusList.filter(s => s.isCheckedIn && !s.isCheckedOut);
    const onBreak = statusList.filter(s => s.isOnBreak);
    const checkedOut = statusList.filter(s => s.isCheckedOut);
    const notCheckedIn = statusList.filter(s => !s.isCheckedIn);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: statusList.length,
      checkedIn: checkedIn.length,
      onBreak: onBreak.length,
      checkedOut: checkedOut.length,
      notCheckedIn: notCheckedIn.length,
      employees: {
        checkedIn,
        onBreak,
        checkedOut,
        notCheckedIn,
      },
      all: statusList
    });
  } catch (error: any) {
    console.error('Error getting live status:', error);
    return NextResponse.json(
      { error: 'Failed to get live status' },
      { status: 500 }
    );
  }
}

