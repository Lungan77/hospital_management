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

    // Validate required fields
    if (!admissionData.firstName || !admissionData.lastName || !admissionData.chiefComplaint || !admissionData.triageLevel) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

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
      gender: admissionData.gender || undefined,
      idNumber: admissionData.idNumber || undefined,
      phone: admissionData.phone || undefined,
      address: admissionData.address || undefined,
      emergencyContact: admissionData.emergencyContact || {},
      admissionType: admissionData.admissionType,
      arrivalMethod: admissionData.arrivalMethod,
      triageLevel: admissionData.triageLevel,
      triageNotes: admissionData.triageNotes || undefined,
      triageTime: new Date(),
      triageNurse: auth.session.user.id,
      chiefComplaint: admissionData.chiefComplaint,
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
    console.error("Error stack:", error.stack);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return Response.json({
        error: "Validation failed",
        validationErrors,
        details: error.message
      }, { status: 400 });
    }

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return Response.json({
        error: "Duplicate patient record detected. Please try again."
      }, { status: 400 });
    }

    return Response.json({
      error: "Error admitting patient",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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