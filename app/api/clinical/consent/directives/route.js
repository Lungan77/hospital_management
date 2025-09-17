import { connectDB } from "@/lib/mongodb";
import TreatmentConsent from "@/models/TreatmentConsent";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, advanceDirectives } = await req.json();

    // Find or create consent record
    let consent = await TreatmentConsent.findOne({ patientAdmissionId });
    
    if (!consent) {
      consent = await TreatmentConsent.create({
        patientAdmissionId,
        consentProvider: {},
        generalConsent: {},
        privacyConsent: { informationSharing: {} },
        advanceDirectives: {},
        legalCompliance: {}
      });
    }

    // Update advance directives
    consent.advanceDirectives = {
      ...advanceDirectives,
      verifiedBy: auth.session.user.id,
      verifiedAt: new Date()
    };
    
    // Update overall status
    consent.updateConsentStatus();
    
    await consent.save();

    return Response.json({ 
      message: "Advance directives recorded successfully",
      consent 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording advance directives:", error);
    return Response.json({ error: "Error recording advance directives" }, { status: 500 });
  }
}