import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import MealPlan from "@/models/MealPlan";
import NutritionalAssessment from "@/models/NutritionalAssessment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const admittedPatients = await PatientAdmission.find({
      status: { $in: ["Admitted", "In Treatment"] }
    })
      .populate("assignedDoctor", "name email")
      .populate("assignedNurse", "name email")
      .populate("triageNurse", "name")
      .sort({ arrivalTime: -1 })
      .lean();

    const calculateAge = (dob) => {
      if (!dob) return null;
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const enrichedPatients = await Promise.all(
      admittedPatients.map(async (admission) => {
        const latestMealPlan = await MealPlan.findOne({
          patientAdmissionId: admission._id,
          status: "Active"
        })
          .sort({ planDate: -1 })
          .lean();

        const latestAssessment = await NutritionalAssessment.findOne({
          patientAdmissionId: admission._id
        })
          .sort({ assessmentDate: -1 })
          .lean();

        const pendingMeals = latestMealPlan ? [
          !latestMealPlan.meals.breakfast?.delivered ? "Breakfast" : null,
          !latestMealPlan.meals.lunch?.delivered ? "Lunch" : null,
          !latestMealPlan.meals.dinner?.delivered ? "Dinner" : null
        ].filter(Boolean) : [];

        return {
          _id: admission._id,
          admissionNumber: admission.admissionNumber,
          mrn: admission.mrn,
          firstName: admission.firstName,
          lastName: admission.lastName,
          dateOfBirth: admission.dateOfBirth,
          age: calculateAge(admission.dateOfBirth),
          gender: admission.gender,
          phone: admission.phone,
          address: admission.address,
          emergencyContact: admission.emergencyContact,
          admissionType: admission.admissionType,
          arrivalMethod: admission.arrivalMethod,
          arrivalTime: admission.arrivalTime,
          triageLevel: admission.triageLevel,
          chiefComplaint: admission.chiefComplaint,
          allergies: admission.allergies,
          currentMedications: admission.currentMedications,
          medicalHistory: admission.medicalHistory,
          vitalSigns: admission.vitalSigns,
          assignedBed: admission.assignedBed,
          assignedWard: admission.assignedWard,
          assignedDoctor: admission.assignedDoctor,
          assignedNurse: admission.assignedNurse,
          status: admission.status,
          latestMealPlan,
          latestAssessment,
          pendingMeals,
          needsAssessment: !latestAssessment ||
            (latestAssessment.followUpDate && new Date(latestAssessment.followUpDate) <= new Date()),
          riskLevel: latestAssessment?.nutritionalRisk?.riskLevel || "Unknown",
          alerts: admission.alerts || []
        };
      })
    );

    const stats = {
      totalPatients: enrichedPatients.length,
      highRisk: enrichedPatients.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical").length,
      needingAssessment: enrichedPatients.filter(p => p.needsAssessment).length,
      activeMealPlans: enrichedPatients.filter(p => p.latestMealPlan).length
    };

    return Response.json({
      patients: enrichedPatients,
      stats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching nutrition patients:", error);
    return Response.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
