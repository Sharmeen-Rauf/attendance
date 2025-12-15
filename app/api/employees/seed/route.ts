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

    let insertedCount = 0;
    let skippedCount = 0;

    for (const emp of employees) {
      const existing = await db.collection('employees').findOne({ id: emp.id });
      if (!existing) {
        await db.collection('employees').insertOne({
          ...emp,
          created_at: new Date()
        });
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      message: insertedCount > 0 
        ? `${insertedCount} employee(s) created successfully${skippedCount > 0 ? `, ${skippedCount} already exist` : ''}`
        : `All employees already exist (${skippedCount} employees)`,
      inserted: insertedCount,
      skipped: skippedCount
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

