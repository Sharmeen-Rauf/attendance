import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured. Please set MONGODB_URI environment variable.' },
        { status: 500 }
      );
    }
    
    const db = await getDatabase();
    const employees = await db.collection('employees').find({}).toArray();
    
    return NextResponse.json(employees.map(emp => ({
      id: emp.id || emp._id,
      name: emp.name,
      email: emp.email || null
    })));
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

