import { connectDB } from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import TestOrder from '@/models/TestOrder';
import Appointment from '@/models/Appointment';
import { isAuthenticated } from '@/hoc/protectedRoute';

export async function GET(req) {
  const { session, error, status } = await isAuthenticated(req, ['doctor']);
  if (error) return Response.json({ error }, { status });

  try {
    await connectDB();

    const testResults = await TestResult.find()
      .populate({
        path: 'testOrderId',
        populate: {
          path: 'appointmentId',
          match: { doctorId: session.user.id },
          populate: [
            { path: 'doctorId', select: 'name email' },
            { path: 'patientId', select: 'name' },
          ],
        },
      })
      .populate('recordedBy', 'name')
      .sort({ recordedAt: -1 });

    const filtered = testResults.filter(result => result.testOrderId?.appointmentId);

    return Response.json({ results: filtered }, { status: 200 });
  } catch (err) {
    console.error('Error fetching doctor test results:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
