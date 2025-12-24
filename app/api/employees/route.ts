import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { EMPLOYEE_CONFIGS } from '@/lib/employeeConfig';

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
    
    // Merge with config to include timing info
    const formattedEmployees = employees.map(emp => {
      const config = EMPLOYEE_CONFIGS[emp.id || emp._id];
      return {
        id: emp.id || emp._id,
        name: emp.name,
        email: emp.email || null,
        officeStartTime: config?.officeStartTime || '09:00',
        officeEndTime: config?.officeEndTime || '17:00',
        flexibleStart: config?.flexibleStart || false,
        requiredHours: config?.requiredHours || 8
      };
    });
    
    return NextResponse.json({ employees: formattedEmployees });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

