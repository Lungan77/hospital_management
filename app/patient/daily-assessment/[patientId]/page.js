"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Droplet,
  Eye,
  Moon,
  Smile,
  TrendingUp,
  AlertCircle,
  Save,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Calendar
} from "lucide-react";

function DailyAssessmentPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    vital: true,
    physical: true,
    systems: false,
    mental: false,
    care: false,
  });

  const [assessment, setAssessment] = useState({
    generalCondition: "Stable",
    consciousness: "Alert",
    painLevel: 0,
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
    },
    respiratoryStatus: "Normal",
    cardiovascularStatus: "Normal",
    neurologicalStatus: {
      pupils: "",
      motorResponse: "",
      verbalResponse: "",
      glasgowComaScale: "",
    },
    gastrointestinalStatus: {
      diet: "",
      appetite: "",
      bowelMovement: "",
      nausea: false,
      vomiting: false,
    },
    urinaryStatus: {
      output: "",
      color: "",
      catheterized: false,
      incontinence: false,
    },
    skinCondition: {
      integrity: "",
      pressureUlcers: false,
      wounds: "",
      edema: "",
    },
    mobilityStatus: "Independent",
    sleepPattern: {
      hoursSlept: "",
      quality: "",
      disturbances: "",
    },
    mentalStatus: {
      mood: "",
      anxiety: false,
      orientation: "",
      behavior: "",
    },
    medicationCompliance: "Good",
    symptomsReported: [],
    interventionsProvided: [],
    laboratoryFindings: "",
    imagingFindings: "",
    progressNotes: "",
    treatmentResponse: "",
    complications: "",
    planForNextDay: "",
    nursingCareProvided: [],
    patientEducation: "",
    familyInvolvement: "",
    dischargeReadiness: "Not Ready",
    followUpRequired: false,
    criticalIssues: [],
  });

  const [symptom, setSymptom] = useState("");
  const [intervention, setIntervention] = useState("");
  const [nursingCare, setNursingCare] = useState("");
  const [criticalIssue, setCriticalIssue] = useState("");

  useEffect(() => {
    fetchPatientData();
    fetchAssessments();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/admission/resources?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok && data.patients?.length > 0) {
        setPatient(data.patients[0]);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`/api/daily-assessments?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/daily-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...assessment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Daily assessment saved successfully!");
        fetchAssessments();
        setTimeout(() => router.push(`/patient/care/${patientId}`), 2000);
      } else {
        setMessage(data.error || "Error saving assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      setMessage("Error saving assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      setAssessment((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeFromArray = (field, index) => {
    setAssessment((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Daily Assessment</h1>
                <p className="text-gray-600 text-xl">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              {showHistory ? "Hide" : "Show"} History
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-semibold mb-1">Admission #</p>
              <p className="text-sm font-bold text-blue-900">{patient.admissionNumber || "N/A"}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-semibold mb-1">Status</p>
              <p className="text-sm font-bold text-green-900">{patient.status}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-semibold mb-1">Ward/Bed</p>
              <p className="text-sm font-bold text-purple-900">
                {patient.assignedWard} - {patient.assignedBed || "N/A"}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-orange-600 font-semibold mb-1">Admitted</p>
              <p className="text-sm font-bold text-orange-900">
                {new Date(patient.arrivalTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {showHistory && assessments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment History</h2>
            <div className="space-y-4">
              {assessments.map((hist) => (
                <div key={hist._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(hist.assessmentDate).toLocaleDateString()} at{" "}
                        {new Date(hist.assessmentDate).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        By: {hist.assessorName} ({hist.assessorRole})
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        hist.generalCondition === "Improving"
                          ? "bg-green-100 text-green-700"
                          : hist.generalCondition === "Stable"
                          ? "bg-blue-100 text-blue-700"
                          : hist.generalCondition === "Deteriorating"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {hist.generalCondition}
                    </span>
                  </div>
                  {hist.progressNotes && (
                    <p className="text-sm text-gray-700 mt-2">{hist.progressNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-6 rounded-2xl border-l-4 ${
              message.includes("success")
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <p
              className={`font-semibold text-lg ${
                message.includes("success") ? "text-green-700" : "text-red-700"
              }`}
            >
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <button
              type="button"
              onClick={() => toggleSection("vital")}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Vital Signs & General Condition</h2>
              </div>
              {expandedSections.vital ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {expandedSections.vital && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      General Condition
                    </label>
                    <select
                      value={assessment.generalCondition}
                      onChange={(e) =>
                        setAssessment({ ...assessment, generalCondition: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Improving">Improving</option>
                      <option value="Stable">Stable</option>
                      <option value="Deteriorating">Deteriorating</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Consciousness Level
                    </label>
                    <select
                      value={assessment.consciousness}
                      onChange={(e) =>
                        setAssessment({ ...assessment, consciousness: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Alert">Alert</option>
                      <option value="Drowsy">Drowsy</option>
                      <option value="Confused">Confused</option>
                      <option value="Unconscious">Unconscious</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pain Level (0-10)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={assessment.painLevel}
                    onChange={(e) =>
                      setAssessment({ ...assessment, painLevel: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>No Pain</span>
                    <span className="font-bold text-lg">{assessment.painLevel}</span>
                    <span>Worst Pain</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={assessment.vitalSigns.bloodPressure}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: { ...assessment.vitalSigns, bloodPressure: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={assessment.vitalSigns.heartRate}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: { ...assessment.vitalSigns, heartRate: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={assessment.vitalSigns.temperature}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: { ...assessment.vitalSigns, temperature: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Respiratory Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={assessment.vitalSigns.respiratoryRate}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: { ...assessment.vitalSigns, respiratoryRate: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Oxygen Saturation (%)
                    </label>
                    <input
                      type="number"
                      value={assessment.vitalSigns.oxygenSaturation}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: {
                            ...assessment.vitalSigns,
                            oxygenSaturation: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={assessment.vitalSigns.weight}
                      onChange={(e) =>
                        setAssessment({
                          ...assessment,
                          vitalSigns: { ...assessment.vitalSigns, weight: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <button
              type="button"
              onClick={() => toggleSection("systems")}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">Systems Review</h2>
              </div>
              {expandedSections.systems ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {expandedSections.systems && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Respiratory Status
                    </label>
                    <select
                      value={assessment.respiratoryStatus}
                      onChange={(e) =>
                        setAssessment({ ...assessment, respiratoryStatus: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Labored">Labored</option>
                      <option value="Requires O2">Requires O2</option>
                      <option value="Ventilated">Ventilated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardiovascular Status
                    </label>
                    <select
                      value={assessment.cardiovascularStatus}
                      onChange={(e) =>
                        setAssessment({ ...assessment, cardiovascularStatus: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Irregular">Irregular</option>
                      <option value="Tachycardia">Tachycardia</option>
                      <option value="Bradycardia">Bradycardia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobility Status
                    </label>
                    <select
                      value={assessment.mobilityStatus}
                      onChange={(e) =>
                        setAssessment({ ...assessment, mobilityStatus: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Independent">Independent</option>
                      <option value="Assisted">Assisted</option>
                      <option value="Bedbound">Bedbound</option>
                      <option value="Wheelchair">Wheelchair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medication Compliance
                    </label>
                    <select
                      value={assessment.medicationCompliance}
                      onChange={(e) =>
                        setAssessment({ ...assessment, medicationCompliance: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Progress Notes & Plan</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Progress Notes *
                </label>
                <textarea
                  value={assessment.progressNotes}
                  onChange={(e) =>
                    setAssessment({ ...assessment, progressNotes: e.target.value })
                  }
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Document patient progress, observations, and any changes..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Treatment Response
                </label>
                <textarea
                  value={assessment.treatmentResponse}
                  onChange={(e) =>
                    setAssessment({ ...assessment, treatmentResponse: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="How is the patient responding to current treatment?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan for Next Day
                </label>
                <textarea
                  value={assessment.planForNextDay}
                  onChange={(e) =>
                    setAssessment({ ...assessment, planForNextDay: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Outline the care plan for tomorrow..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discharge Readiness
                  </label>
                  <select
                    value={assessment.dischargeReadiness}
                    onChange={(e) =>
                      setAssessment({ ...assessment, dischargeReadiness: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Ready">Not Ready</option>
                    <option value="Improving">Improving</option>
                    <option value="Nearly Ready">Nearly Ready</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    checked={assessment.followUpRequired}
                    onChange={(e) =>
                      setAssessment({ ...assessment, followUpRequired: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    Follow-up Required
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Symptoms Reported
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="Add symptom..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray("symptomsReported", symptom, setSymptom)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {assessment.symptomsReported.map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeFromArray("symptomsReported", i)}
                        className="text-blue-900 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interventions Provided
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={intervention}
                    onChange={(e) => setIntervention(e.target.value)}
                    placeholder="Add intervention..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray("interventionsProvided", intervention, setIntervention)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {assessment.interventionsProvided.map((int, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {int}
                      <button
                        type="button"
                        onClick={() => removeFromArray("interventionsProvided", i)}
                        className="text-green-900 hover:text-green-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Critical Issues
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={criticalIssue}
                    onChange={(e) => setCriticalIssue(e.target.value)}
                    placeholder="Add critical issue..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray("criticalIssues", criticalIssue, setCriticalIssue)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {assessment.criticalIssues.map((issue, i) => (
                    <span
                      key={i}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {issue}
                      <button
                        type="button"
                        onClick={() => removeFromArray("criticalIssues", i)}
                        className="text-red-900 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Save className="w-6 h-6" />
              {submitting ? "Saving..." : "Save Daily Assessment"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/patient/care/${patientId}`)}
              className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(DailyAssessmentPage, ["doctor", "nurse", "er", "admin"]);
