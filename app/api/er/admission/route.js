import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";
import User from "@/models/User";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const admissionData = await req.json();

    // Minimal validation - only check for absolutely required fields
    if (!admissionData.firstName || !admissionData.lastName) {
      return Response.json({
        error: "Missing patient name"
      }, { status: 400 });
    }

    // Set defaults for required fields
    const admissionType = admissionData.admissionType || "Emergency";
    const arrivalMethod = admissionData.arrivalMethod || "Walk-in";
    const triageLevel = admissionData.triageLevel || "5 - Non-Urgent";
    const chiefComplaint = admissionData.chiefComplaint || "General consultation";

    // Clean up optional enum fields - convert empty strings to undefined
    const gender = admissionData.gender && admissionData.gender.trim() !== ""
      ? admissionData.gender
      : undefined;

    // Convert string values to proper types for vital signs
    const vitalSigns = admissionData.vitalSigns ? {
      bloodPressure: admissionData.vitalSigns.bloodPressure || undefined,
      heartRate: admissionData.vitalSigns.heartRate ? Number(admissionData.vitalSigns.heartRate) : undefined,
      temperature: admissionData.vitalSigns.temperature ? Number(admissionData.vitalSigns.temperature) : undefined,
      respiratoryRate: admissionData.vitalSigns.respiratoryRate ? Number(admissionData.vitalSigns.respiratoryRate) : undefined,
      oxygenSaturation: admissionData.vitalSigns.oxygenSaturation ? Number(admissionData.vitalSigns.oxygenSaturation) : undefined,
      weight: admissionData.vitalSigns.weight ? Number(admissionData.vitalSigns.weight) : undefined,
      height: admissionData.vitalSigns.height ? Number(admissionData.vitalSigns.height) : undefined,
      recordedBy: auth.session.user.id,
      recordedAt: new Date()
    } : {
      recordedBy: auth.session.user.id,
      recordedAt: new Date()
    };

    // Create patient admission record
    const admission = new PatientAdmission({
      firstName: admissionData.firstName,
      lastName: admissionData.lastName,
      dateOfBirth: admissionData.dateOfBirth || undefined,
      gender: gender,
      idNumber: admissionData.idNumber || undefined,
      phone: admissionData.phone || undefined,
      address: admissionData.address || undefined,
      emergencyContact: admissionData.emergencyContact || {},
      admissionType: admissionType,
      arrivalMethod: arrivalMethod,
      triageLevel: triageLevel,
      triageNotes: admissionData.triageNotes || undefined,
      triageTime: new Date(),
      triageNurse: auth.session.user.id,
      chiefComplaint: chiefComplaint,
      presentingSymptoms: admissionData.presentingSymptoms || undefined,
      painScale: admissionData.painScale ? Number(admissionData.painScale) : 0,
      allergies: admissionData.allergies || undefined,
      currentMedications: admissionData.currentMedications || undefined,
      medicalHistory: admissionData.medicalHistory || undefined,
      vitalSigns: vitalSigns,
      assignedBed: admissionData.assignedBed || undefined,
      assignedWard: admissionData.assignedWard || undefined,
      assignedDoctor: admissionData.assignedDoctor || undefined,
      assignedNurse: admissionData.assignedNurse || undefined,
      assignedSpecialists: [],
      assignedEquipment: [],
      admittedBy: auth.session.user.id,
      insurance: admissionData.insurance || {},
      emergencyId: admissionData.emergencyId || undefined
    });

    // Save to generate IDs via pre-save hook
    await admission.save();

    // If this is from an emergency, update the emergency record
    if (admissionData.emergencyId) {
      await Emergency.findByIdAndUpdate(admissionData.emergencyId, {
        status: "Admitted to ER",
        erAdmissionCompleted: true,
        admittedPatientId: admission._id
      });
    }

    return Response.json({
      message: "Patient admitted successfully",
      patientId: admission.patientId,
      admissionId: admission._id
    });

  } catch (error) {
    console.error("Admission error:", error);
    return Response.json({
      error: "Failed to admit patient",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const admissions = await PatientAdmission.find()
      .populate("triageNurse", "firstName lastName")
      .populate("assignedDoctor", "firstName lastName specialty")
      .populate("assignedNurse", "firstName lastName")
      .populate("admittedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(50);

    return Response.json({ admissions });

  } catch (error) {
    console.error("Error fetching admissions:", error);
    return Response.json({ error: "Failed to fetch admissions" }, { status: 500 });
  }
}
