import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import Emergency from "@/models/Emergency";
import Bed from "@/models/Bed";
import Ward from "@/models/Ward";
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

    // Handle bed assignment if wardId and bedId are provided
    let assignedBed = null;
    let assignedWard = null;

    if (admissionData.bedId && admissionData.wardId) {
      const bed = await Bed.findById(admissionData.bedId).populate("wardId");

      if (!bed) {
        return Response.json({ error: "Bed not found" }, { status: 404 });
      }

      if (bed.status !== "Available") {
        return Response.json({ error: "Bed is not available" }, { status: 400 });
      }

      if (bed.wardId._id.toString() !== admissionData.wardId) {
        return Response.json({ error: "Bed does not belong to the selected ward" }, { status: 400 });
      }

      assignedBed = bed.bedNumber;
      assignedWard = bed.wardId.wardName;

      // Mark bed as occupied
      bed.status = "Occupied";
      bed.assignedAt = new Date();
      bed.assignedBy = auth.session.user.id;

      // We'll set currentPatient after admission is created
      await bed.save();
    }

    // Create patient admission record
    const admission = await PatientAdmission.create({
      ...admissionData,
      assignedBed: assignedBed || admissionData.assignedBed,
      assignedWard: assignedWard || admissionData.assignedWard,
      triageTime: new Date(),
      triageNurse: auth.session.user.id,
      admittedBy: auth.session.user.id,
      vitalSigns: {
        ...admissionData.vitalSigns,
        recordedBy: auth.session.user.id,
        recordedAt: new Date()
      }
    });

    // Update bed with patient information
    if (admissionData.bedId) {
      await Bed.findByIdAndUpdate(admissionData.bedId, {
        currentPatient: admission._id,
        $push: {
          occupancyHistory: {
            patientId: admission._id,
            admittedAt: new Date(),
            assignedBy: auth.session.user.id
          }
        }
      });

      // Update ward capacity
      const ward = await Ward.findById(admissionData.wardId);
      if (ward) {
        await ward.updateCapacity();
      }
    }

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
      message: "Patient admitted successfully" + (assignedBed ? ` and assigned to bed ${assignedBed} in ${assignedWard}` : ""),
      admission: {
        _id: admission._id,
        patientId: admission.patientId,
        admissionNumber: admission.admissionNumber,
        triageLevel: admission.triageLevel,
        assignedBed: admission.assignedBed,
        assignedWard: admission.assignedWard,
        name: `${admission.firstName} ${admission.lastName}`
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error admitting patient:", error);
    return Response.json({ error: "Error admitting patient" }, { status: 500 });
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