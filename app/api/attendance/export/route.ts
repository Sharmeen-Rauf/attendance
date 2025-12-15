import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import * as XLSX from 'xlsx';

const MAX_BREAK_DURATION_MINUTES = 30;

export async function GET(request: NextRequest) {
  try {
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
      .sort({ date: -1, employee_name: 1 })
      .toArray();

    // Prepare data for Excel
    const excelData = records.map((record: any) => {
      const checkIn = record.check_in_time 
        ? new Date(record.check_in_time).toLocaleTimeString('en-US', { hour12: false })
        : '-';
      
      const checkOut = record.check_out_time 
        ? new Date(record.check_out_time).toLocaleTimeString('en-US', { hour12: false })
        : '-';
      
      let breakDuration = '-';
      if (record.break_duration) {
        const minutes = Math.floor(record.break_duration / 60);
        const seconds = record.break_duration % 60;
        breakDuration = `${minutes}m ${seconds}s`;
      }

      const statusText = record.status === 'on_time' ? 'On Time' :
                        record.status === 'grace' ? 'Grace Period' :
                        record.status === 'late' ? 'Late' : record.status;

      return {
        'Employee Name': record.employee_name,
        'Employee ID': record.employee_id,
        'Date': record.date,
        'Check-In': checkIn,
        'Check-Out': checkOut,
        'Break Duration': breakDuration,
        'Status': statusText,
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add styling (basic - XLSX doesn't support full styling, but we can add notes)
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Employee Name
      { wch: 15 }, // Employee ID
      { wch: 12 }, // Date
      { wch: 12 }, // Check-In
      { wch: 12 }, // Check-Out
      { wch: 15 }, // Break Duration
      { wch: 15 }, // Status
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="attendance_${filterDate || 'all'}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting attendance:', error);
    return NextResponse.json(
      { error: 'Failed to export attendance' },
      { status: 500 }
    );
  }
}

