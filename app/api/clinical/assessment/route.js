import { connectDB } from "@/lib/mongodb";
import ClinicalData from "@/models/ClinicalData";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, physicalAssessment } = await req.json();

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

    // Update physical assessment
    clinicalData.physicalAssessment = {
      ...physicalAssessment,
      assessedBy: auth.session.user.id,
      assessedAt: new Date()
    };
    
    // Update completeness score
    clinicalData.calculateCompleteness();
    
    await clinicalData.save();

    return Response.json({ 
      message: "Physical assessment recorded successfully",
      clinicalData 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording physical assessment:", error);
    return Response.json({ error: "Error recording physical assessment" }, { status: 500 });
  }
}