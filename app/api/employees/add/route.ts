import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
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
    const { id, name, email } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Employee ID and name are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if employee already exists
    const existing = await db.collection('employees').findOne({ id });
    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this ID already exists' },
        { status: 400 }
      );
    }

    // Create new employee
    const employee = {
      id,
      name,
      email: email || null,
      created_at: new Date()
    };

    await db.collection('employees').insertOne(employee);

    return NextResponse.json({
      success: true,
      message: 'Employee added successfully',
      employee
    });
  } catch (error: any) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee' },
      { status: 500 }
    );
  }
}

