import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Diagnosis from "@/models/Diagnosis";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { diagnosisId, consultationFee, labTestsFee = 0, medicationFee = 0, otherCharges = 0 } = await req.json();

    if (!diagnosisId || !consultationFee) {
      return Response.json({ error: "Diagnosis ID and consultation fee are required" }, { status: 400 });
    }

    // ✅ Fetch the diagnosis details
    const diagnosis = await Diagnosis.findById(diagnosisId).populate("appointmentId", "patientId");
    if (!diagnosis) {
      return Response.json({ error: "Diagnosis not found" }, { status: 404 });
    }

    // ✅ Extract patient and doctor from the diagnosis
    const patientId = diagnosis.appointmentId?.patientId;
    const doctorId = auth.session.user.id;

    if (!patientId) {
      return Response.json({ error: "Patient information is missing in the diagnosis" }, { status: 400 });
    }

    // ✅ Convert values to numbers before calculations
    const consultation = Number(consultationFee) || 0;
    const labTests = Number(labTestsFee) || 0;
    const medication = Number(medicationFee) || 0;
    const others = Number(otherCharges) || 0;

    // ✅ Calculate total amount safely
    const totalAmount = consultation + labTests + medication + others;

    // ✅ Create and save the bill
    const newBill = await Bill.create({
      patientId,
      doctorId,
      diagnosisId,
      consultationFee,
      labTestsFee,
      medicationFee,
      otherCharges,
      totalAmount,
    });

    return Response.json({ message: "Bill created successfully", bill: newBill }, { status: 201 });
  } catch (error) {
    console.error("Error generating bill:", error);
    return Response.json({ error: "Error generating bill" }, { status: 500 });
  }
}
