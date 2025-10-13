import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();
    const { admissionId, assignedDoctor, assignedNurse, resourceType, resourceData } = body;

    if (!admissionId) {
      return Response.json({ error: "Admission ID is required" }, { status: 400 });
    }

    const admission = await PatientAdmission.findById(admissionId);
    if (!admission) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    if (assignedDoctor !== undefined) {
      admission.assignedDoctor = assignedDoctor;
    }

    if (assignedNurse !== undefined) {
      admission.assignedNurse = assignedNurse;
    }

    if (resourceType && resourceData) {
      switch (resourceType) {
        case "doctor":
          admission.assignedDoctor = resourceData.doctorId;
          break;

        case "nurse":
          admission.assignedNurse = resourceData.nurseId;
          break;

        case "specialist":
          if (!resourceData.specialistId || !resourceData.specialty) {
            return Response.json({ error: "Specialist ID and specialty required" }, { status: 400 });
          }
          admission.assignedSpecialists.push({
            specialistId: resourceData.specialistId,
            specialty: resourceData.specialty,
            assignedBy: auth.session.user.id,
            notes: resourceData.notes || ""
          });
          break;

        case "equipment":
          if (!resourceData.equipmentType) {
            return Response.json({ error: "Equipment type required" }, { status: 400 });
          }
          admission.assignedEquipment.push({
            equipmentType: resourceData.equipmentType,
            equipmentId: resourceData.equipmentId || `${resourceData.equipmentType}-${Date.now()}`,
            assignedBy: auth.session.user.id,
            notes: resourceData.notes || "",
            status: "Active"
          });
          break;

        default:
          return Response.json({ error: "Invalid resource type" }, { status: 400 });
      }
    }

    await admission.save();

    return Response.json({
      message: "Resource assigned successfully",
      admission
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning resource:", error);
    return Response.json({
      error: "Error assigning resource",
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get("admissionId");
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");

    if (!admissionId || !resourceType) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const admission = await PatientAdmission.findById(admissionId);
    if (!admission) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    switch (resourceType) {
      case "specialist":
        admission.assignedSpecialists = admission.assignedSpecialists.filter(
          s => s._id.toString() !== resourceId
        );
        break;

      case "equipment":
        const equipment = admission.assignedEquipment.id(resourceId);
        if (equipment) {
          equipment.status = "Removed";
          equipment.removedAt = new Date();
        }
        break;

      default:
        return Response.json({ error: "Invalid resource type" }, { status: 400 });
    }

    await admission.save();

    return Response.json({
      message: "Resource removed successfully",
      admission
    }, { status: 200 });
  } catch (error) {
    console.error("Error removing resource:", error);
    return Response.json({
      error: "Error removing resource",
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const admissionId = searchParams.get("admissionId");

    if (!admissionId) {
      return Response.json({ error: "Admission ID required" }, { status: 400 });
    }

    const admission = await PatientAdmission.findById(admissionId)
      .populate("assignedDoctor", "name email role")
      .populate("assignedNurse", "name email role")
      .populate("assignedSpecialists.specialistId", "name email role")
      .populate("assignedSpecialists.assignedBy", "name")
      .populate("assignedEquipment.assignedBy", "name")
      .lean();

    if (!admission) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    return Response.json({ admission }, { status: 200 });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return Response.json({
      error: "Error fetching resources",
      details: error.message
    }, { status: 500 });
  }
}
