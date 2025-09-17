import { connectDB } from "@/lib/mongodb";
import TreatmentConsent from "@/models/TreatmentConsent";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, privacyConsent } = await req.json();

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

    // Update privacy consent
    consent.privacyConsent = {
      ...privacyConsent,
      consentDate: new Date(),
      witnessedBy: auth.session.user.id
    };
    
    // Update overall status
    consent.updateConsentStatus();
    
    await consent.save();

    return Response.json({ 
      message: "Privacy consent recorded successfully",
      consent 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording privacy consent:", error);
    return Response.json({ error: "Error recording privacy consent" }, { status: 500 });
  }
}