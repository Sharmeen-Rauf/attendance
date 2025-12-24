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
    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    if (status === 'approved') {
      updateData.approved_at = new Date();
    } else {
      updateData.rejected_at = new Date();
    }

    // Try to find by id field first, if not found try _id as ObjectId
    let query: any = { id };
    const result = await db.collection('leave_records').updateOne(
      query,
      { $set: updateData }
    );

    // If not found by id field, try ObjectId
    if (result.matchedCount === 0) {
      try {
        const objectId = new ObjectId(id);
        const resultById = await db.collection('leave_records').updateOne(
          { _id: objectId },
          { $set: updateData }
        );
        if (resultById.matchedCount === 0) {
          return NextResponse.json(
            { error: 'Leave record not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ 
          message: `Leave request ${status}`,
          modified: resultById.modifiedCount > 0 
        });
      } catch (error) {
        // Invalid ObjectId format
        return NextResponse.json(
          { error: 'Leave record not found' },
          { status: 404 }
        );
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

