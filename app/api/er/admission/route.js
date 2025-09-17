import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const admissionData = await req.json();

    // Validate required fields
    if (!admissionData.firstName || !admissionData.lastName || !admissionData.chiefComplaint || !admissionData.triageLevel) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create patient admission record
    const admission = await PatientAdmission.create({
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
      message: "Patient admitted successfully",
      admission: {
        _id: admission._id,
        patientId: admission.patientId,
        admissionNumber: admission.admissionNumber,
        triageLevel: admission.triageLevel,
        assignedBed: admission.assignedBed
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error admitting patient:", error);
    return Response.json({ error: "Error admitting patient" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const admissions = await PatientAdmission.find({
      status: { $in: ["Admitted", "In Treatment", "Waiting"] }
    })
    .populate("triageNurse", "name")
    .populate("admittedBy", "name")
    .populate("assignedDoctor", "name")
    .populate("assignedNurse", "name")
    .sort({ arrivalTime: -1 })
    .limit(50);

    return Response.json({ admissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admissions:", error);
    return Response.json({ error: "Error fetching admissions" }, { status: 500 });
  }
}