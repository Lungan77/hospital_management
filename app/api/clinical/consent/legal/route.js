import { connectDB } from "@/lib/mongodb";
import TreatmentConsent from "@/models/TreatmentConsent";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientAdmissionId, legalCompliance } = await req.json();

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

    // Update legal compliance
    consent.legalCompliance = legalCompliance;
    
    // Update overall status
    consent.updateConsentStatus();
    
    // Mark as completed if all required items are checked
    if (legalCompliance.patientRights && legalCompliance.financialResponsibility) {
      consent.consentStatus.completedBy = auth.session.user.id;
      consent.consentStatus.completedAt = new Date();
    }
    
    await consent.save();

    return Response.json({ 
      message: "Legal compliance recorded successfully",
      consent 
    }, { status: 200 });
  } catch (error) {
    console.error("Error recording legal compliance:", error);
    return Response.json({ error: "Error recording legal compliance" }, { status: 500 });
  }
}