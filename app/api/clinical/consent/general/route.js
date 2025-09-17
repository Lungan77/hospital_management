import { connectDB } from "@/lib/mongodb";
import TreatmentConsent from "@/models/TreatmentConsent";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, generalConsent, consentProvider } = await req.json();

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

    // Update general consent and provider info
    consent.generalConsent = {
      ...generalConsent,
      consentDate: new Date(),
      witnessedBy: auth.session.user.id
    };
    
    consent.consentProvider = consentProvider;
    
    // Update overall status
    consent.updateConsentStatus();
    
    await consent.save();

    return Response.json({ 
      message: "General consent recorded successfully",
      consent 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording general consent:", error);
    return Response.json({ error: "Error recording general consent" }, { status: 500 });
  }
}