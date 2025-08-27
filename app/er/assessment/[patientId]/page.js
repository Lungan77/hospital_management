"use client";
import { useEffect, useState, use } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  User, 
  Activity, 
  Heart, 
  Clock, 
  MapPin, 
  Phone,
  FileText,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Truck,
  Navigation,
  Save,
  Eye,
  Brain,
  Droplets,
  Zap,
  Thermometer
} from "lucide-react";

function ERPatientAssessment({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const [patient, setPatient] = useState(null);
  const [assessment, setAssessment] = useState({
    triageLevel: "",
    chiefComplaint: "",
    presentingSymptoms: "",
    allergies: "",
    currentMedications: "",
    medicalHistory: "",
    erNotes: "",
    disposition: "",
    assignedBed: "",
    assignedNurse: "",
    assignedDoctor: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      const res = await fetch(`/api/er/patient/${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
        // Pre-populate assessment with existing data
        if (data.patient.assessment) {
          setAssessment(data.patient.assessment);
        }
      } else {
        setMessage("Error fetching patient details");
      }
    } catch (error) {
      setMessage("Error loading patient data");
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/er/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: patientId,
          assessment
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchPatientDetails(); // Refresh data
      }
    } catch (error) {
      setMessage("Error saving assessment");
    } finally {
      setSaving(false);
    }
  };

  const handleAssessmentChange = (field, value) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

  const getTriageColor = (level) => {
    const colors = {
      "1 - Resuscitation": "bg-red-100 text-red-700 border-red-200",
      "2 - Emergency": "bg-orange-100 text-orange-700 border-orange-200",
      "3 - Urgent": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "4 - Less Urgent": "bg-green-100 text-green-700 border-green-200",
      "5 - Non-Urgent": "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[level] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient assessment...</p>
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
          <p className="text-gray-600">Unable to load patient information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-orange-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Patient Assessment</h1>
                <p className="text-gray-600 text-xl">Emergency Room Patient Evaluation</p>
              </div>
            </div>
            
            {/* Patient Info Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{patient.incidentNumber}</div>
                <div className="text-sm text-blue-600">Incident Number</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-lg font-bold text-green-600">{patient.patientName || "Unknown"}</div>
                <div className="text-sm text-green-600">Patient Name</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-lg font-bold text-purple-600">{patient.priority}</div>
                <div className="text-sm text-purple-600">Priority Level</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-lg font-bold text-orange-600">{patient.type}</div>
                <div className="text-sm text-orange-600">Emergency Type</div>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Patient Information & Handover Data */}
          <div className="space-y-8">
            {/* Pre-hospital Information */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Pre-hospital Information</h2>
                <p className="text-blue-100">Data from emergency response team</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Patient Demographics</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {patient.patientName || "Unknown"}</p>
                      <p><strong>Age:</strong> {patient.patientAge ? `${patient.patientAge} years` : "Unknown"}</p>
                      <p><strong>Gender:</strong> {patient.patientGender || "Unknown"}</p>
                      <p><strong>Emergency Type:</strong> {patient.type}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Emergency Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Reported:</strong> {new Date(patient.reportedAt).toLocaleString()}</p>
                      <p><strong>Location:</strong> {patient.address}</p>
                      <p><strong>Caller:</strong> {patient.callerName} ({patient.callerPhone})</p>
                      <p><strong>Ambulance:</strong> {patient.ambulanceId?.callSign || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Presenting Condition</h4>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700">{patient.patientCondition}</p>
                    {patient.chiefComplaint && (
                      <p className="text-gray-600 mt-2"><strong>Chief Complaint:</strong> {patient.chiefComplaint}</p>
                    )}
                  </div>
                </div>

                {/* Medical History from Pre-hospital */}
                {(patient.symptoms || patient.medicalHistory || patient.allergies || patient.currentMedications) && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Medical History</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {patient.symptoms && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-600 font-medium text-sm">Symptoms</p>
                          <p className="text-blue-800 text-sm">{patient.symptoms}</p>
                        </div>
                      )}
                      {patient.allergies && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-red-600 font-medium text-sm">Allergies</p>
                          <p className="text-red-800 text-sm">{patient.allergies}</p>
                        </div>
                      )}
                      {patient.medicalHistory && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-green-600 font-medium text-sm">Medical History</p>
                          <p className="text-green-800 text-sm">{patient.medicalHistory}</p>
                        </div>
                      )}
                      {patient.currentMedications && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-purple-600 font-medium text-sm">Current Medications</p>
                          <p className="text-purple-800 text-sm">{patient.currentMedications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vital Signs History */}
            {patient.vitalSigns?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Vital Signs History</h2>
                  <p className="text-green-100">Pre-hospital vital signs monitoring</p>
                </div>
                
                <div className="p-8">
                  <div className="space-y-4">
                    {patient.vitalSigns.map((vital, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">
                            Vital Signs #{patient.vitalSigns.length - index}
                          </h4>
                          <span className="text-sm text-gray-600">
                            {new Date(vital.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: "Blood Pressure", value: vital.bloodPressure, icon: <Heart className="w-4 h-4 text-red-500" /> },
                            { label: "Heart Rate", value: `${vital.heartRate} bpm`, icon: <Activity className="w-4 h-4 text-pink-500" /> },
                            { label: "Temperature", value: `${vital.temperature}°C`, icon: <Thermometer className="w-4 h-4 text-orange-500" /> },
                            { label: "SpO2", value: `${vital.oxygenSaturation}%`, icon: <Droplets className="w-4 h-4 text-blue-500" /> },
                            { label: "Respiratory Rate", value: `${vital.respiratoryRate}/min`, icon: <Activity className="w-4 h-4 text-green-500" /> },
                            { label: "Pain Scale", value: `${vital.painScale}/10`, icon: <Zap className="w-4 h-4 text-yellow-500" /> },
                            { label: "Glucose", value: vital.glucoseLevel ? `${vital.glucoseLevel} mg/dL` : "N/A", icon: <Zap className="w-4 h-4 text-purple-500" /> },
                            { label: "Consciousness", value: vital.consciousnessLevel, icon: <Brain className="w-4 h-4 text-indigo-500" /> }
                          ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                {item.icon}
                                <span className="text-xs text-gray-500">{item.label}</span>
                              </div>
                              <p className="font-semibold text-gray-800">{item.value || "N/A"}</p>
                            </div>
                          ))}
                        </div>
                        {vital.symptoms && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-600 font-medium text-sm">Symptoms Noted</p>
                            <p className="text-blue-800 text-sm">{vital.symptoms}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Treatment History */}
            {patient.treatments?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Pre-hospital Treatments</h2>
                  <p className="text-purple-100">Treatments administered by EMS</p>
                </div>
                
                <div className="p-8">
                  <div className="space-y-4">
                    {patient.treatments.map((treatment, index) => (
                      <div key={index} className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-purple-900">{treatment.treatment}</h4>
                          <span className="text-sm text-purple-600">
                            {new Date(treatment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {treatment.medication && (
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-purple-600 font-medium">Medication</p>
                              <p className="text-purple-800">{treatment.medication}</p>
                            </div>
                            <div>
                              <p className="text-purple-600 font-medium">Dosage</p>
                              <p className="text-purple-800">{treatment.dosage}</p>
                            </div>
                            <div>
                              <p className="text-purple-600 font-medium">Route</p>
                              <p className="text-purple-800">{treatment.route}</p>
                            </div>
                          </div>
                        )}
                        {treatment.response && (
                          <div className="mt-3 p-3 bg-white rounded-lg">
                            <p className="text-purple-600 font-medium text-sm">Patient Response</p>
                            <p className="text-purple-800 text-sm">{treatment.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ER Assessment Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">ER Assessment</h2>
              <p className="text-red-100">Emergency room evaluation and triage</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Triage Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Triage Level</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "1 - Resuscitation",
                    "2 - Emergency", 
                    "3 - Urgent",
                    "4 - Less Urgent",
                    "5 - Non-Urgent"
                  ].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleAssessmentChange('triageLevel', level)}
                      className={`p-4 border-2 rounded-xl font-semibold transition-all duration-200 text-left ${
                        assessment.triageLevel === level
                          ? getTriageColor(level) + " shadow-lg transform scale-105"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chief Complaint</label>
                <textarea
                  value={assessment.chiefComplaint}
                  onChange={(e) => handleAssessmentChange('chiefComplaint', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Primary reason for ER visit..."
                />
              </div>

              {/* Presenting Symptoms */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Presenting Symptoms</label>
                <textarea
                  value={assessment.presentingSymptoms}
                  onChange={(e) => handleAssessmentChange('presentingSymptoms', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Current symptoms and observations..."
                />
              </div>

              {/* Medical Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Allergies</label>
                  <input
                    type="text"
                    value={assessment.allergies}
                    onChange={(e) => handleAssessmentChange('allergies', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Known allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Medications</label>
                  <input
                    type="text"
                    value={assessment.currentMedications}
                    onChange={(e) => handleAssessmentChange('currentMedications', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Current medications..."
                  />
                </div>
              </div>

              {/* Medical History */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Medical History</label>
                <textarea
                  value={assessment.medicalHistory}
                  onChange={(e) => handleAssessmentChange('medicalHistory', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Relevant medical history..."
                />
              </div>

              {/* ER Assignment */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Assigned Bed</label>
                  <input
                    type="text"
                    value={assessment.assignedBed}
                    onChange={(e) => handleAssessmentChange('assignedBed', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Bed 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Assigned Nurse</label>
                  <input
                    type="text"
                    value={assessment.assignedNurse}
                    onChange={(e) => handleAssessmentChange('assignedNurse', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nurse name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Assigned Doctor</label>
                  <input
                    type="text"
                    value={assessment.assignedDoctor}
                    onChange={(e) => handleAssessmentChange('assignedDoctor', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Doctor name..."
                  />
                </div>
              </div>

              {/* Disposition */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Disposition</label>
                <select
                  value={assessment.disposition}
                  onChange={(e) => handleAssessmentChange('disposition', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Disposition</option>
                  <option value="Admit to Ward">Admit to Ward</option>
                  <option value="Admit to ICU">Admit to ICU</option>
                  <option value="Observation">Observation</option>
                  <option value="Discharge">Discharge</option>
                  <option value="Transfer">Transfer to Another Facility</option>
                  <option value="Surgery">Surgery Required</option>
                </select>
              </div>

              {/* ER Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">ER Assessment Notes</label>
                <textarea
                  value={assessment.erNotes}
                  onChange={(e) => handleAssessmentChange('erNotes', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="ER physician assessment, treatment plan, and notes..."
                />
              </div>

              {/* Save Assessment */}
              <button
                onClick={saveAssessment}
                disabled={saving}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-6 rounded-2xl font-bold text-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-xl hover:shadow-red-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Assessment...
                  </div>
                ) : (
                  <>
                    <Save className="w-6 h-6 inline mr-3" />
                    Save ER Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ERPatientAssessment, ["er", "doctor", "nurse"]);