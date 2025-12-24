import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const month = searchParams.get('month'); // YYYY-MM format
    const year = searchParams.get('year');

    const db = await getDatabase();
    let query: any = {};

    if (employeeId) {
      query.employee_id = employeeId;
    }

    if (month) {
      query.month = month;
    }

    if (year) {
      query.year = parseInt(year);
    }

    const payrollRecords = await db.collection('payroll_records')
      .find(query)
      .sort({ year: -1, month: -1, employee_id: 1 })
      .toArray();

    return NextResponse.json({ payroll: payrollRecords });
  } catch (error: any) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll records' },
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
    const { employeeId, employeeName, month, year, baseSalary, allowances, deductions, total } = body;

    if (!employeeId || !employeeName || !month || !year || baseSalary === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const payrollRecord = {
      employee_id: employeeId,
      employee_name: employeeName,
      month,
      year: parseInt(year),
      base_salary: parseFloat(baseSalary),
      allowances: allowances || 0,
      deductions: deductions || 0,
      total: total || (parseFloat(baseSalary) + (allowances || 0) - (deductions || 0)),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Check if record already exists
    const existing = await db.collection('payroll_records').findOne({
      employee_id: employeeId,
      month,
      year: parseInt(year),
    });

    if (existing) {
      const result = await db.collection('payroll_records').updateOne(
        { _id: existing._id },
        { $set: { ...payrollRecord, updated_at: new Date() } }
      );
      return NextResponse.json({ 
        message: 'Payroll record updated',
        id: existing._id 
      }, { status: 200 });
    } else {
      const result = await db.collection('payroll_records').insertOne(payrollRecord);
      return NextResponse.json({ 
        message: 'Payroll record created',
        id: result.insertedId 
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating payroll record:', error);
    return NextResponse.json(
      { error: 'Failed to create payroll record' },
      { status: 500 }
    );
  }
}

