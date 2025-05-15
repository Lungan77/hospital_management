import { connectDB } from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import { isAuthenticated } from '@/hoc/protectedRoute';
import TestOrder from '@/models/TestOrder';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export const GET = async (req, { params }) => {
  const { id } = params;

  const { session, error, status } = await isAuthenticated(req, ['labtech', 'doctor']);
  if (error) {
    return new Response(JSON.stringify({ message: error }), { status });
  }
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await connectDB();

    const testResult = await TestResult.findById(id)
      .populate('recordedBy', 'name')
      .populate({
        path: 'testOrderId',
        populate: {
          path: 'appointmentId',
          populate: [
            { path: 'doctorId', select: 'name email' },
            { path: 'patientId', select: 'name' }
          ]
        }
      });

    if (!testResult) {
      return new Response('Test result not found', { status: 404 });
    }

    return new Response(JSON.stringify(testResult), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
