import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { emergencyId, verificationNotes } = await req.json();

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    if (!emergency.handover?.completed) {
      return Response.json({ error: "Handover not completed by EMS" }, { status: 400 });
    }

    // Mark handover as verified by ER
    emergency.handover.verified = true;
    emergency.handover.verifiedBy = auth.session.user.id;
    emergency.handover.verifiedAt = new Date();
    emergency.handover.verificationNotes = verificationNotes;

    // Update status to completed
    emergency.status = "Completed";
    emergency.completedAt = new Date();

    await emergency.save();

    // Automatically create patient admission record
    const admissionNumber = `ADM-${Date.now()}`;
    const patientId = `PAT-${Date.now()}`;

    const patientAdmission = await PatientAdmission.create({
      patientId,
      admissionNumber,
      emergencyId: emergency._id,

      // Patient Information from emergency
      firstName: emergency.patientName?.split(' ')[0] || 'Unknown',
      lastName: emergency.patientName?.split(' ').slice(1).join(' ') || 'Patient',
      gender: emergency.patientGender || 'Other',
      phone: emergency.callerPhone,
      emergencyContact: {
        name: emergency.callerName,
        relationship: emergency.callerRelation || 'Unknown',
        phone: emergency.callerPhone
      },

      // Admission Details
      admissionType: 'Emergency',
      arrivalMethod: 'Ambulance',
      arrivalTime: emergency.arrivedHospitalAt || new Date(),

      // Triage Information from ER assessment or emergency
      triageLevel: emergency.erAssessment?.triageLevel || '2 - Emergency',
      triageNotes: emergency.handover.paramedicSummary || emergency.patientCondition,
      triageTime: new Date(),
      triageNurse: auth.session.user.id,

      // Medical Information
      chiefComplaint: emergency.chiefComplaint || emergency.patientCondition || 'Emergency admission',
      presentingSymptoms: emergency.symptoms || emergency.erAssessment?.presentingSymptoms || '',
      allergies: emergency.allergies || emergency.erAssessment?.allergies || '',
      currentMedications: emergency.currentMedications || emergency.erAssessment?.currentMedications || '',
      medicalHistory: emergency.medicalHistory || emergency.erAssessment?.medicalHistory || '',

      // Vital Signs from emergency (get latest)
      vitalSigns: emergency.vitalSigns?.length > 0 ? {
        bloodPressure: emergency.vitalSigns[emergency.vitalSigns.length - 1].bloodPressure,
        heartRate: emergency.vitalSigns[emergency.vitalSigns.length - 1].heartRate,
        temperature: emergency.vitalSigns[emergency.vitalSigns.length - 1].temperature,
        respiratoryRate: emergency.vitalSigns[emergency.vitalSigns.length - 1].respiratoryRate,
        oxygenSaturation: emergency.vitalSigns[emergency.vitalSigns.length - 1].oxygenSaturation,
        recordedBy: auth.session.user.id,
        recordedAt: new Date()
      } : undefined,

      // Assignment from ER assessment
      assignedBed: emergency.erAssessment?.assignedBed,
      assignedWard: emergency.erAssessment?.assignedWard,
      assignedDoctor: emergency.erAssessment?.assignedDoctor,
      assignedNurse: emergency.erAssessment?.assignedNurse,

      // Status
      status: 'Admitted',
      admittedBy: auth.session.user.id
    });

    // Update ambulance status back to available
    if (emergency.ambulanceId) {
      await Ambulance.findByIdAndUpdate(emergency.ambulanceId, {
        status: "Available",
        currentEmergency: null
      });
    }

    return Response.json({
      message: "Handover verified successfully - Patient automatically admitted to ER",
      emergency,
      patientAdmission: {
        patientId: patientAdmission.patientId,
        admissionNumber: patientAdmission.admissionNumber,
        name: `${patientAdmission.firstName} ${patientAdmission.lastName}`,
        status: patientAdmission.status
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error verifying handover:", error);
    return Response.json({ error: "Error verifying handover" }, { status: 500 });
  }
}