// app/api/results/route.js

import { connectDB } from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import TestOrder from '@/models/TestOrder';
import Appointment from '@/models/Appointment';
import { isAuthenticated } from '@/hoc/protectedRoute';

export async function GET(req) {
  await connectDB();

  const { session, error, status } = await isAuthenticated(req, ['labtech']);
  if (error) {
    return Response.json({ message: error }, { status });
  }

  try {
    const testResults = await TestResult.find()
      .populate({
        path: 'testOrderId',
        populate: {
          path: 'appointmentId',
          populate: {
            path: 'patientId',
            select: 'name',
          },
        },
      })
      .populate('recordedBy', 'name')
      .sort({ recordedAt: -1 });

    return Response.json({ testResults }, { status: 200 });
  } catch (err) {
    console.error('Error fetching test results:', err);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
