import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/dbConnect';
import Appointment from '@/models/Appointment';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();
    const { appointmentId } = req.body;

    const token = uuidv4();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      checkInToken: token,
      checkInTokenExpires: expires,
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ token });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
