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
    testResult.status = 'Approved';
    testResult.approvedAt = new Date();
    console.log('Test result approved at:', testResult.approvedAt);
    await testResult.save();

    // Send email notification to the doctor
    const doctor = testResult.testOrderId.appointmentId.doctorId;

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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2E86C1;">Test Result Approved</h2>
          <p>Dear Dr. <strong>${doctor.name}</strong>,</p>
          <p>We are pleased to inform you that the test result for your patient has been <strong>approved</strong>.</p>
          <p>Please log in to the system to view the full details of the test result.</p>
          <br />
          <p>Best regards,</p>
          <p><em>Your Lab Team</em></p>
          <hr style="border:none; border-top: 1px solid #eee; margin-top: 20px;" />
          <small style="color: #888;">This is an automated message. Please do not reply to this email.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ message: 'Test result approved and email sent' }, { status: 200 });
  } catch (error) {
    console.error('Error approving test result:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
