import { connectDB } from "@/lib/mongodb";
import ClinicalData from "@/models/ClinicalData";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      patientAdmissionId, 
      bloodPressure, 
      heartRate, 
      temperature, 
      respiratoryRate, 
      oxygenSaturation, 
      weight, 
      height,
      painScale,
      consciousnessLevel,
      notes
    } = await req.json();

    // Calculate BMI if weight and height provided
    let bmi = null;
    if (weight && height) {
      const weightKg = parseFloat(weight);
      const heightM = parseFloat(height) / 100;
      if (weightKg > 0 && heightM > 0) {
        bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
      }
    }

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

    // Add new vital signs entry
    const vitalSigns = {
      recordedBy: auth.session.user.id,
      bloodPressure,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      bmi,
      painScale: parseInt(painScale) || 0,
      consciousnessLevel,
      notes
    };

    clinicalData.vitalSigns.push(vitalSigns);
    
    // Update completeness score
    clinicalData.calculateCompleteness();
    
    await clinicalData.save();

    return Response.json({ 
      message: "Vital signs recorded successfully",
      clinicalData 
    }, { status: 201 });
  } catch (error) {
    console.error("Error recording vital signs:", error);
    return Response.json({ error: "Error recording vital signs" }, { status: 500 });
  }
}