import { connectDB } from "@/lib/mongodb";
import InfectionControl from "@/models/InfectionControl";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PATCH(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const infectionCase = await InfectionControl.findById(id);
    if (!infectionCase) {
      return Response.json({ error: "Infection control case not found" }, { status: 404 });
    }

    const {
      assignedWard,
      assignedRoom,
      status,
      isolationEndDate,
      resolutionNotes,
      addProtocol,
      addContact,
      addLabResult,
      addEnvironmentalCleaning,
      updateMonitoring
    } = body;

    if (assignedWard) {
      infectionCase.assignedWard = assignedWard;
      infectionCase.assignedRoom = assignedRoom;
      infectionCase.wardAssignedBy = auth.session.user.id;
      infectionCase.wardAssignedAt = new Date();
    }

    if (status) {
      infectionCase.status = status;
      if (status === "Resolved") {
        infectionCase.resolvedDate = new Date();
        infectionCase.resolvedBy = auth.session.user.id;
        infectionCase.resolutionNotes = resolutionNotes;
      }
    }

    if (isolationEndDate) {
      infectionCase.isolationEndDate = new Date(isolationEndDate);
    }

    if (addProtocol) {
      infectionCase.protocols.push({
        protocolName: addProtocol.protocolName,
        description: addProtocol.description,
        implementedBy: auth.session.user.id,
        implementedAt: new Date(),
        status: "Active"
      });
    }

    if (addContact) {
      infectionCase.contacts.push({
        contactType: addContact.contactType,
        contactName: addContact.contactName,
        exposureDate: addContact.exposureDate,
        exposureType: addContact.exposureType,
        notified: addContact.notified || false,
        followUpRequired: addContact.followUpRequired !== undefined ? addContact.followUpRequired : true
      });
    }

    if (addLabResult) {
      infectionCase.labResults.push({
        testName: addLabResult.testName,
        result: addLabResult.result,
        date: addLabResult.date || new Date(),
        notes: addLabResult.notes
      });
    }

    if (addEnvironmentalCleaning) {
      infectionCase.environmentalCleaning.push({
        cleanedBy: auth.session.user.id,
        cleanedAt: new Date(),
        area: addEnvironmentalCleaning.area,
        disinfectantUsed: addEnvironmentalCleaning.disinfectantUsed,
        verified: false
      });
    }

    if (updateMonitoring) {
      infectionCase.monitoringSchedule = {
        frequency: updateMonitoring.frequency,
        lastMonitored: new Date(),
        nextMonitoring: updateMonitoring.nextMonitoring ? new Date(updateMonitoring.nextMonitoring) : null
      };
    }

    await infectionCase.save();

    return Response.json({
      message: "Infection control case updated successfully",
      infectionControl: infectionCase
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating infection control case:", error);
    return Response.json({ error: "Error updating infection control case" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;

    const infectionCase = await InfectionControl.findById(id)
      .populate("patientAdmissionId", "firstName lastName admissionNumber chiefComplaint status age gender")
      .populate("identifiedBy", "name title email")
      .populate("assignedWard", "name type capacity")
      .populate("wardAssignedBy", "name title")
      .populate("protocols.implementedBy", "name title")
      .populate("resolvedBy", "name title")
      .populate("environmentalCleaning.cleanedBy", "name title")
      .populate("environmentalCleaning.verifiedBy", "name title");

    if (!infectionCase) {
      return Response.json({ error: "Infection control case not found" }, { status: 404 });
    }

    return Response.json({ infectionControl: infectionCase }, { status: 200 });
  } catch (error) {
    console.error("Error fetching infection control case:", error);
    return Response.json({ error: "Error fetching infection control case" }, { status: 500 });
  }
}
