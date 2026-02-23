import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Hospital from '@/models/Hospital';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const hospital = await Hospital.findById(params.id);

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({ hospital }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();

    const hospital = await Hospital.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Hospital updated successfully',
      hospital
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating hospital:', error);
    return NextResponse.json({ error: 'Failed to update hospital' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const hospital = await Hospital.findByIdAndDelete(params.id);

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Hospital deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    return NextResponse.json({ error: 'Failed to delete hospital' }, { status: 500 });
  }
}
