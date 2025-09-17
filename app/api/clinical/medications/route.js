import { connectDB } from "@/lib/mongodb";
import ClinicalData from "@/models/ClinicalData";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, medications } = await req.json();

    // Find or create clinical data record
    let clinicalData = await ClinicalData.findOne({ patientAdmissionId });
    
    if (!clinicalData) {
      clinicalData = await ClinicalData.create({
        patientAdmissionId,
        vitalSigns: [],
        allergies: [],
        medications: []
      });
    }

    // Update medications with recording info
    clinicalData.medications = medications.map(medication => ({
      ...medication,
      recordedBy: auth.session.user.id,
      startDate: medication.startDate || new Date()
    }));
    
    // Update completeness score
    clinicalData.calculateCompleteness();
    
    await clinicalData.save();

    return Response.json({ 
      message: "Medications recorded successfully",
      clinicalData 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording medications:", error);
    return Response.json({ error: "Error recording medications" }, { status: 500 });
  }
}