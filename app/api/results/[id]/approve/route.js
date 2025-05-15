import { connectDB } from '@/lib/mongodb';
import TestResult from '@/models/TestResult';
import TestOrder from '@/models/TestOrder';
import Appointment from '@/models/Appointment';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req, { params }) {
  await connectDB();

  try {
    const testResult = await TestResult.findById(params.id)
      .populate({
        path: 'testOrderId',
        populate: {
          path: 'appointmentId',
          populate: {
            path: 'doctorId',
            select: 'name email',
          },
        },
      });

    if (!testResult) {
      return Response.json({ message: 'Test result not found' }, { status: 404 });
    }

    // Update the status to 'approved'
    testResult.status = 'approved';
    await testResult.save();

    // Send email notification to the doctor
    const doctor = testResult.testOrderId.appointmentId.userId;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: doctor.email,
      subject: 'Test Result Approved',
      text: `Dear Dr. ${doctor.name},\n\nThe test result for your patient has been approved.\n\nBest regards,\nYour Lab Team`,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ message: 'Test result approved and email sent' }, { status: 200 });
  } catch (error) {
    console.error('Error approving test result:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
