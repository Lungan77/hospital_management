"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { 
  Shield, 
  FileText, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Edit,
  Save,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Signature,
  Lock,
  Heart,
  Brain,
  Activity,
  Users,
  Search
} from "lucide-react";

function TreatmentConsent() {
  const searchParams = useSearchParams();
  const patientAdmissionId = searchParams.get("patientId");
  
  const [patient, setPatient] = useState(null);
  const [consent, setConsent] = useState(null);
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Consent form states
  const [generalConsent, setGeneralConsent] = useState({
    consentGiven: false,
    limitations: "",
    notes: ""
  });
  
  const [consentProvider, setConsentProvider] = useState({
    isPatient: true,
    name: "",
    relationship: "",
    idNumber: "",
    phone: "",
    address: "",
    legalGuardian: false,
    powerOfAttorney: false
  });
  
  const [privacyConsent, setPrivacyConsent] = useState({
    hipaaAcknowledged: false,
    informationSharing: {
      familyMembers: false,
      emergencyContact: true,
      insuranceCompany: true,
      otherProviders: true,
      researchPurposes: false
    }
  });
  
  const [advanceDirectives, setAdvanceDirectives] = useState({
    hasAdvanceDirective: false,
    livingWill: false,
    dnrOrder: false,
    healthcarePowerOfAttorney: false,
    organDonor: false,
    documentLocation: "",
    notes: ""
  });
  
  const [legalCompliance, setLegalCompliance] = useState({
    patientRights: false,
    grievanceProcedure: false,
    financialResponsibility: false,
    visitationPolicy: false,
    dischargePlanning: false,
    interpreterServices: false,
    religiousServices: false
  });

  useEffect(() => {
    if (patientAdmissionId) {
      fetchPatientData();
      fetchConsentData();
    }
  }, [patientAdmissionId]);

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/er/patient/${patientAdmissionId}`);
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
        // Pre-populate consent provider with patient info
        setConsentProvider(prev => ({
          ...prev,
          name: `${data.patient.firstName} ${data.patient.lastName}`,
          phone: data.patient.phone || "",
          address: data.patient.address || ""
        }));
      } else {
        setMessage("Error loading patient data");
      }
    } catch (error) {
      setMessage("Error fetching patient information");
    }
  };

  const fetchConsentData = async () => {
    try {
      const res = await fetch(`/api/clinical/consent/${patientAdmissionId}`);
      const data = await res.json();
      if (res.ok && data.consent) {
        setConsent(data.consent);
        // Pre-populate forms with existing data
        if (data.consent.generalConsent) {
          setGeneralConsent(data.consent.generalConsent);
        }
        if (data.consent.consentProvider) {
          setConsentProvider(data.consent.consentProvider);
        }
        if (data.consent.privacyConsent) {
          setPrivacyConsent(data.consent.privacyConsent);
        }
        if (data.consent.advanceDirectives) {
          setAdvanceDirectives(data.consent.advanceDirectives);
        }
        if (data.consent.legalCompliance) {
          setLegalCompliance(data.consent.legalCompliance);
        }
      }
    } catch (error) {
      console.error("Error fetching consent data");
    } finally {
      setLoading(false);
    }
  };

  const saveConsent = async (section) => {
    setSaving(true);
    try {
      let endpoint = "";
      let data = {};
      
      switch (section) {
        case "general":
          endpoint = "/api/clinical/consent/general";
          data = { patientAdmissionId, generalConsent, consentProvider };
          break;
        case "privacy":
          endpoint = "/api/clinical/consent/privacy";
          data = { patientAdmissionId, privacyConsent };
          break;
        case "directives":
          endpoint = "/api/clinical/consent/directives";
          data = { patientAdmissionId, advanceDirectives };
          break;
        case "legal":
          endpoint = "/api/clinical/consent/legal";
          data = { patientAdmissionId, legalCompliance };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} consent saved successfully`);
        fetchConsentData();
      } else {
        setMessage(result.error || "Error saving consent");
      }
    } catch (error) {
      setMessage("Error recording consent");
    } finally {
      setSaving(false);
    }
  };

  const getConsentStatus = () => {
    if (!consent) return { status: "Pending", color: "gray", percentage: 0 };
    
    const requiredConsents = [
      generalConsent.consentGiven,
      privacyConsent.hipaaAcknowledged,
      legalCompliance.patientRights,
      legalCompliance.financialResponsibility
    ];
    
    const completedConsents = requiredConsents.filter(Boolean).length;
    const percentage = Math.round((completedConsents / requiredConsents.length) * 100);
    
    if (percentage === 100) return { status: "Complete", color: "green", percentage };
    if (percentage > 0) return { status: "Partial", color: "yellow", percentage };
    return { status: "Pending", color: "red", percentage };
  };

  const consentStatus = getConsentStatus();

  const sections = [
    { key: "general", label: "General Consent", icon: <FileText className="w-5 h-5" />, color: "blue" },
    { key: "privacy", label: "Privacy & HIPAA", icon: <Lock className="w-5 h-5" />, color: "purple" },
    { key: "directives", label: "Advance Directives", icon: <Heart className="w-5 h-5" />, color: "red" },
    { key: "legal", label: "Legal Compliance", icon: <Shield className="w-5 h-5" />, color: "green" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading consent forms...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-600">Unable to load patient information for consent capture</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Treatment Consent</h1>
                  <p className="text-gray-600 text-xl">Legal consent and authorization documentation</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  consentStatus.color === "green" ? "text-green-600" :
                  consentStatus.color === "yellow" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {consentStatus.percentage}%
                </div>
                <div className="text-gray-600">{consentStatus.status}</div>
              </div>
            </div>
            
            {/* Patient Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-lg font-bold text-blue-600">
                  {patient.firstName} {patient.lastName}
                </div>
                <div className="text-sm text-blue-600">Patient Name</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-lg font-bold text-green-600">{patient.patientId}</div>
                <div className="text-sm text-green-600">Patient ID</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-lg font-bold text-purple-600">{patient.triageLevel}</div>
                <div className="text-sm text-purple-600">Triage Level</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-lg font-bold text-orange-600">{patient.assignedBed || "Not assigned"}</div>
                <div className="text-sm text-orange-600">Assigned Bed</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Section Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeSection === section.key
                    ? `bg-${section.color}-600 text-white shadow-lg transform scale-105`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className={activeSection === section.key ? "text-white" : `text-${section.color}-600`}>
                  {section.icon}
                </span>
                {section.label}
                {consent && (
                  <span className={`w-3 h-3 rounded-full ${
                    (section.key === "general" && consent.generalConsent?.consentGiven) ||
                    (section.key === "privacy" && consent.privacyConsent?.hipaaAcknowledged) ||
                    (section.key === "directives" && consent.advanceDirectives?.hasAdvanceDirective !== undefined) ||
                    (section.key === "legal" && consent.legalCompliance?.patientRights)
                      ? "bg-green-400" : "bg-gray-400"
                  }`}></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* General Consent */}
          {activeSection === "general" && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">General Treatment Consent</h2>
                <p className="text-blue-100">Basic consent for medical treatment and care</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Consent Provider */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Consent Provider Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={consentProvider.isPatient}
                          onChange={(e) => setConsentProvider(prev => ({ ...prev, isPatient: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Patient providing own consent</label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={consentProvider.name}
                          onChange={(e) => setConsentProvider(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Name of person providing consent"
                        />
                      </div>
                      
                      {!consentProvider.isPatient && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to Patient</label>
                          <select
                            value={consentProvider.relationship}
                            onChange={(e) => setConsentProvider(prev => ({ ...prev, relationship: e.target.value }))}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Child">Adult Child</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Legal Guardian">Legal Guardian</option>
                            <option value="Power of Attorney">Power of Attorney</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
                        <input
                          type="text"
                          value={consentProvider.idNumber}
                          onChange={(e) => setConsentProvider(prev => ({ ...prev, idNumber: e.target.value }))}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Government ID number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={consentProvider.phone}
                          onChange={(e) => setConsentProvider(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Contact phone number"
                        />
                      </div>
                      
                      {!consentProvider.isPatient && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={consentProvider.legalGuardian}
                              onChange={(e) => setConsentProvider(prev => ({ ...prev, legalGuardian: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Legal Guardian</label>
                          </div>
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={consentProvider.powerOfAttorney}
                              onChange={(e) => setConsentProvider(prev => ({ ...prev, powerOfAttorney: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Power of Attorney for Healthcare</label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* General Consent */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Treatment Consent</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                      <div className="flex items-center gap-4 mb-4">
                        <input
                          type="checkbox"
                          checked={generalConsent.consentGiven}
                          onChange={(e) => setGeneralConsent(prev => ({ ...prev, consentGiven: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-lg font-semibold text-blue-900">
                          I consent to medical treatment and care
                        </label>
                      </div>
                      <p className="text-blue-800 text-sm mb-4">
                        I understand that medical treatment may involve risks and I consent to receive medical care, 
                        including but not limited to diagnostic procedures, medications, and therapeutic interventions 
                        as deemed necessary by the medical team.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Limitations or Restrictions</label>
                      <textarea
                        value={generalConsent.limitations}
                        onChange={(e) => setGeneralConsent(prev => ({ ...prev, limitations: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="Any limitations on treatment consent..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        value={generalConsent.notes}
                        onChange={(e) => setGeneralConsent(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="Additional consent notes..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => saveConsent("general")}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save General Consent"}
                </button>
              </div>
            </div>
          )}

          {/* Privacy & HIPAA */}
          {activeSection === "privacy" && (
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Privacy & HIPAA Consent</h2>
                <p className="text-purple-100">Information sharing and privacy acknowledgments</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* HIPAA Acknowledgment */}
                <div className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="checkbox"
                      checked={privacyConsent.hipaaAcknowledged}
                      onChange={(e) => setPrivacyConsent(prev => ({ ...prev, hipaaAcknowledged: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label className="text-lg font-semibold text-purple-900">
                      HIPAA Privacy Notice Acknowledged
                    </label>
                  </div>
                  <p className="text-purple-800 text-sm">
                    I acknowledge that I have received and understand the Notice of Privacy Practices 
                    describing how my health information may be used and disclosed.
                  </p>
                </div>

                {/* Information Sharing Preferences */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Information Sharing Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { key: "familyMembers", label: "Share with Family Members", desc: "Allow family members to receive health information" },
                      { key: "emergencyContact", label: "Share with Emergency Contact", desc: "Allow emergency contact to receive health information" },
                      { key: "insuranceCompany", label: "Share with Insurance Company", desc: "Allow sharing for billing and coverage purposes" },
                      { key: "otherProviders", label: "Share with Other Healthcare Providers", desc: "Allow sharing for continuity of care" },
                      { key: "researchPurposes", label: "Use for Research Purposes", desc: "Allow de-identified data use for medical research" }
                    ].map((item) => (
                      <div key={item.key} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={privacyConsent.informationSharing[item.key]}
                            onChange={(e) => setPrivacyConsent(prev => ({
                              ...prev,
                              informationSharing: {
                                ...prev.informationSharing,
                                [item.key]: e.target.checked
                              }
                            }))}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div>
                            <label className="font-semibold text-gray-900">{item.label}</label>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => saveConsent("privacy")}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Privacy Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* Advance Directives */}
          {activeSection === "directives" && (
            <div>
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Advance Directives</h2>
                <p className="text-red-100">End-of-life care preferences and directives</p>
              </div>
              
              <div className="p-8 space-y-6">
                {[
                  { key: "hasAdvanceDirective", label: "Has Advance Directive", desc: "Patient has completed advance directive documents" },
                  { key: "livingWill", label: "Living Will", desc: "Patient has a living will specifying treatment preferences" },
                  { key: "dnrOrder", label: "DNR Order", desc: "Do Not Resuscitate order in place" },
                  { key: "healthcarePowerOfAttorney", label: "Healthcare Power of Attorney", desc: "Designated healthcare decision maker" },
                  { key: "organDonor", label: "Organ Donor", desc: "Patient is registered organ donor" }
                ].map((item) => (
                  <div key={item.key} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={advanceDirectives[item.key]}
                        onChange={(e) => setAdvanceDirectives(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div>
                        <label className="font-semibold text-gray-900">{item.label}</label>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Document Location</label>
                  <input
                    type="text"
                    value={advanceDirectives.documentLocation}
                    onChange={(e) => setAdvanceDirectives(prev => ({ ...prev, documentLocation: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Where advance directive documents are located"
                  />
                </div>

                <button
                  onClick={() => saveConsent("directives")}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Advance Directives"}
                </button>
              </div>
            </div>
          )}

          {/* Legal Compliance */}
          {activeSection === "legal" && (
            <div>
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Legal Compliance</h2>
                <p className="text-green-100">Required legal acknowledgments and compliance items</p>
              </div>
              
              <div className="p-8 space-y-6">
                {[
                  { key: "patientRights", label: "Patient Rights Acknowledged", desc: "Patient rights and responsibilities explained and understood" },
                  { key: "grievanceProcedure", label: "Grievance Procedure Explained", desc: "Process for filing complaints or grievances explained" },
                  { key: "financialResponsibility", label: "Financial Responsibility Acknowledged", desc: "Understanding of financial obligations for treatment" },
                  { key: "visitationPolicy", label: "Visitation Policy Explained", desc: "Hospital visitation policies and restrictions explained" },
                  { key: "dischargePlanning", label: "Discharge Planning Discussed", desc: "Discharge planning process and expectations discussed" },
                  { key: "interpreterServices", label: "Interpreter Services Offered", desc: "Language interpretation services offered if needed" },
                  { key: "religiousServices", label: "Religious Services Available", desc: "Chaplain and religious services availability explained" }
                ].map((item) => (
                  <div key={item.key} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={legalCompliance[item.key]}
                        onChange={(e) => setLegalCompliance(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <label className="font-semibold text-gray-900">{item.label}</label>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveConsent("legal")}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Legal Compliance"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Consent Summary */}
        {consent && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Consent Summary
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "General Consent", completed: consent.generalConsent?.consentGiven, icon: <FileText className="w-5 h-5" /> },
                { label: "HIPAA Acknowledged", completed: consent.privacyConsent?.hipaaAcknowledged, icon: <Lock className="w-5 h-5" /> },
                { label: "Patient Rights", completed: consent.legalCompliance?.patientRights, icon: <Shield className="w-5 h-5" /> },
                { label: "Financial Responsibility", completed: consent.legalCompliance?.financialResponsibility, icon: <FileText className="w-5 h-5" /> }
              ].map((item, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 ${
                  item.completed 
                    ? "bg-green-50 border-green-200" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={item.completed ? "text-green-600" : "text-gray-400"}>
                      {item.icon}
                    </span>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className={`font-semibold ${item.completed ? "text-green-900" : "text-gray-600"}`}>
                    {item.label}
                  </div>
                  <div className={`text-sm ${item.completed ? "text-green-600" : "text-gray-500"}`}>
                    {item.completed ? "Complete" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(TreatmentConsent, ["nurse", "doctor", "receptionist"]);