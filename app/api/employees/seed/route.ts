import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI environment variable.' },
        { status: 500 }
      );
    }

    const db = await getDatabase();
    const employees = [
      { id: 'EMP001', name: 'John Doe', email: 'john@company.com' },
      { id: 'EMP002', name: 'Jane Smith', email: 'jane@company.com' },
      { id: 'EMP003', name: 'Mike Johnson', email: 'mike@company.com' },
      { id: 'EMP004', name: 'Sarah Williams', email: 'sarah@company.com' },
      { id: 'EMP005', name: 'David Brown', email: 'david@company.com' },
    ];

    const result = await db.collection('employees').insertMany(employees);

    return NextResponse.json({
      message: 'Sample employees created successfully',
      count: result.insertedCount
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({
        message: 'Employees already exist'
      });
    }
    console.error('Error seeding employees:', error);
    return NextResponse.json(
      { error: 'Failed to seed employees' },
      { status: 500 }
    );
  }
}

