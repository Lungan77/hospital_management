import { connectDB } from '@/lib/mongodb';
import TestOrder from '@/models/TestOrder';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import { isAuthenticated } from '@/hoc/protectedRoute';

export const GET = async (req) => {
  const { session, error, status } = await isAuthenticated(req, ['doctor']);
  if (error) return Response.json({ error }, { status });

  try {
    await connectDB();
    const app = await Appointment.find({ doctorId: session.user.id });

    const testOrders = await TestOrder.find({ appointmentId: { $in: app } })
      .populate('appointmentId')
        .populate({ path: 'appointmentId.patientId', select: 'name' })
      .sort({ createdAt: -1 });

    console.log('Fetched test orders:', testOrders);
    return new Response(JSON.stringify({ data: testOrders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching test orders:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
