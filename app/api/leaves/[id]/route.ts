import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, remarks } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Try to find by id field first, if not found try _id as ObjectId
    let query: any = { id };
    let leaveRecord = await db.collection('leave_records').findOne(query);

    // If not found by id field, try _id
    if (!leaveRecord) {
      try {
        const objectId = new ObjectId(id);
        leaveRecord = await db.collection('leave_records').findOne({ _id: objectId });
        query = { _id: objectId };
      } catch (error) {
        // Invalid ObjectId format
      }
    }

    if (!leaveRecord) {
      return NextResponse.json(
        { error: 'Leave record not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else {
      updateData.rejectedAt = new Date();
    }

    const result = await db.collection('leave_records').updateOne(
      query,
      { $set: updateData }
    );

    // Create notification for employee
    const { randomUUID } = require('crypto');
    await db.collection('notifications').insertOne({
      id: randomUUID(), // Custom ID field (MongoDB will auto-generate _id as ObjectId)
      employeeId: leaveRecord.employeeId || leaveRecord.employee_id,
      employeeName: leaveRecord.employeeName || leaveRecord.employee_name,
      type: `leave_${status}`,
      title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your ${leaveRecord.type || leaveRecord.leave_type || 'leave'} request for ${leaveRecord.startDate || leaveRecord.start_date}${(leaveRecord.endDate || leaveRecord.end_date) && (leaveRecord.endDate || leaveRecord.end_date) !== (leaveRecord.startDate || leaveRecord.start_date) ? ` to ${leaveRecord.endDate || leaveRecord.end_date}` : ''} has been ${status === 'approved' ? 'approved' : 'rejected'}.${remarks ? ` Remarks: ${remarks}` : ''}`,
      read: false,
      createdAt: new Date(),
    });

    // Send email notification if email exists (can be implemented later)
    const employeeEmail = leaveRecord.employeeEmail || leaveRecord.email;
    if (employeeEmail) {
      try {
        console.log(`Sending ${status} notification email to ${employeeEmail}`);
        // Email sending logic can be added here
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }

    return NextResponse.json({ 
      message: `Leave request ${status}`,
      modified: result.modifiedCount > 0 
    });
  } catch (error: any) {
    console.error('Error updating leave record:', error);
    return NextResponse.json(
      { error: 'Failed to update leave record' },
      { status: 500 }
    );
  }
}

