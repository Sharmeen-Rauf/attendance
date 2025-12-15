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
      { id: 'MUH001', name: 'Muhammad Umar', email: 'umar@company.com' },
      { id: 'MUH002', name: 'Muhammad Hassan', email: 'hassan@company.com' },
      { id: 'MUH003', name: 'Muhammad Hamdan', email: 'hamdan@company.com' },
      { id: 'SHA001', name: 'Sharmeen Rauf', email: 'sharmeen@company.com' },
      { id: 'RAB001', name: 'Rabia', email: 'rabia@company.com' },
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

