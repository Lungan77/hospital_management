import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const admissionData = await req.json();

    // Validate required fields
    if (!admissionData.firstName || !admissionData.lastName || !admissionData.chiefComplaint || !admissionData.triageLevel) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }


    // Create patient admission record
    const admission = new PatientAdmission({
      ...admissionData,
      triageTime: new Date(),
      triageNurse: auth.session.user.id,
      admittedBy: auth.session.user.id,
      vitalSigns: {
        ...admissionData.vitalSigns,
        recordedBy: auth.session.user.id,
        recordedAt: new Date()
      }
    });

    // Save to generate IDs via pre-save hook
    await admission.save();

    // If this is from an emergency, update the emergency record
    if (admissionData.emergencyId) {
      await Emergency.findByIdAndUpdate(admissionData.emergencyId, {
        status: "Admitted to Hospital",
        completedAt: new Date(),
        erAssessment: {
          triageLevel: admissionData.triageLevel,
          chiefComplaint: admissionData.chiefComplaint,
          presentingSymptoms: admissionData.presentingSymptoms,
          allergies: admissionData.allergies,
          currentMedications: admissionData.currentMedications,
          medicalHistory: admissionData.medicalHistory,
          erNotes: admissionData.triageNotes,
          assignedBed: admissionData.assignedBed,
          assignedNurse: admissionData.assignedNurse,
          assignedDoctor: admissionData.assignedDoctor,
          assessedBy: auth.session.user.id,
          assessedAt: new Date()
        }
      });
    }

    return Response.json({
      message: "Patient admitted successfully. You can now assign a bed from the Bed Management page.",
      admission: {
        _id: admission._id,
        patientId: admission.patientId,
        admissionNumber: admission.admissionNumber,
        triageLevel: admission.triageLevel,
        name: `${admission.firstName} ${admission.lastName}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error admitting patient:", error);
    console.error("Error details:", error.message);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return Response.json({
        error: "Duplicate patient record detected. Please try again."
      }, { status: 400 });
    }

    return Response.json({
      error: "Error admitting patient",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor", "admin", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const admissions = await PatientAdmission.find({
      status: { $in: ["Admitted", "In Treatment", "Waiting"] }
    })
    .populate({
      path: "triageNurse",
      select: "name",
      strictPopulate: false
    })
    .populate({
      path: "admittedBy",
      select: "name",
      strictPopulate: false
    })
    .populate({
      path: "assignedDoctor",
      select: "name",
      strictPopulate: false
    })
    .populate({
      path: "assignedNurse",
      select: "name",
      strictPopulate: false
    })
    .populate({
      path: "emergencyId",
      select: "incidentNumber patientCondition handover",
      strictPopulate: false
    })
    .sort({ arrivalTime: -1 })
    .limit(50)
    .lean();

    return Response.json({ admissions: admissions || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admissions:", error);
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error fetching admissions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}