"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  ClipboardCheck,
  User,
  Activity,
  TrendingUp,
  AlertTriangle,
  Save,
  Calendar,
  FileText,
  Heart,
  Utensils,
  Droplets,
  Target,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ArrowLeft
} from "lucide-react";

function NutritionalAssessmentPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("anthropometric");

  const [assessment, setAssessment] = useState({
    patientAdmissionId: patientId,
    assessmentDate: new Date().toISOString().split("T")[0],
    anthropometricData: {
      height: { value: "", unit: "cm" },
      weight: { value: "", unit: "kg" },
      bmi: 0,
      idealBodyWeight: "",
      percentIdealBodyWeight: "",
      recentWeightChange: {
        amount: "",
        timeframe: "",
        significance: "None"
      }
    },
    biochemicalData: {
      albumin: "",
      prealbumin: "",
      totalProtein: "",
      hemoglobin: "",
      glucose: "",
      electrolytes: {
        sodium: "",
        potassium: "",
        chloride: "",
        calcium: ""
      }
    },
    clinicalData: {
      diagnosis: "",
      medicalHistory: [],
      currentMedications: [],
      functionalStatus: "Independent",
      pressureUlcers: false,
      edema: false,
      dehydration: false,
      malnutritionSigns: []
    },
    dietaryHistory: {
      usualIntake: {
        breakfast: "",
        lunch: "",
        dinner: "",
        snacks: ""
      },
      appetiteLevel: "Good",
      recentIntakeChanges: "",
      difficultyChewing: false,
      difficultySwallowing: false,
      nauseaVomiting: false,
      diarrhea: false,
      constipation: false,
      foodAllergies: [],
      foodIntolerances: [],
      culturalPreferences: [],
      religiousRestrictions: []
    },
    nutritionalRisk: {
      screeningTool: "MUST",
      score: 0,
      riskLevel: "Low",
      riskFactors: []
    },
    nutritionalDiagnosis: [],
    nutritionalGoals: [],
    interventions: [],
    energyProteinRequirements: {
      estimatedEnergyRequirement: { value: "", unit: "kcal/day", method: "" },
      estimatedProteinRequirement: { value: "", unit: "g/day", method: "" },
      fluidRequirement: { value: "", unit: "ml/day" }
    },
    recommendedDietType: "Regular",
    recommendedTexture: "Regular",
    recommendedFluidConsistency: "Not Applicable",
    monitoringPlan: {
      frequency: "",
      parametersToMonitor: [],
      nextAssessmentDate: ""
    },
    dieticianNotes: "",
    recommendationsForTeam: "",
    status: "Initial"
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  useEffect(() => {
    calculateBMI();
  }, [assessment.anthropometricData.height.value, assessment.anthropometricData.weight.value]);

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

  const calculateBMI = () => {
    const height = parseFloat(assessment.anthropometricData.height.value);
    const weight = parseFloat(assessment.anthropometricData.weight.value);

    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setAssessment(prev => ({
        ...prev,
        anthropometricData: {
          ...prev.anthropometricData,
          bmi: parseFloat(bmi)
        }
      }));
    }
  };

  const addItem = (path, item) => {
    const keys = path.split('.');
    setAssessment(prev => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current[lastKey])) {
        current[lastKey] = [...current[lastKey], item];
      }

      return newState;
    });
  };

  const removeItem = (path, index) => {
    const keys = path.split('.');
    setAssessment(prev => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current[lastKey])) {
        current[lastKey] = current[lastKey].filter((_, i) => i !== index);
      }

      return newState;
    });
  };

  const saveAssessment = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/nutrition/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Assessment saved successfully!");
        setTimeout(() => router.push("/dietician/assessments"), 2000);
      } else {
        setMessage(data.error || "Error saving assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      setMessage("Error saving assessment");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "anthropometric", label: "Anthropometric", icon: <Activity className="w-5 h-5" /> },
    { key: "biochemical", label: "Biochemical", icon: <Droplets className="w-5 h-5" /> },
    { key: "clinical", label: "Clinical", icon: <Heart className="w-5 h-5" /> },
    { key: "dietary", label: "Dietary History", icon: <Utensils className="w-5 h-5" /> },
    { key: "risk", label: "Risk & Diagnosis", icon: <AlertTriangle className="w-5 h-5" /> },
    { key: "plan", label: "Care Plan", icon: <Target className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient data...</p>
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
          <p className="text-gray-600 mb-6">Unable to load patient information</p>
          <button
            onClick={() => router.push("/nutrition/patients")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/nutrition/patients")}
                className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Nutritional Assessment</h1>
                <p className="text-gray-600 text-xl mt-2">
                  {patient.firstName} {patient.lastName} - {patient.admissionNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Chief Complaint</p>
              <p className="text-lg font-bold text-blue-900">{patient.chiefComplaint || "N/A"}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">Status</p>
              <p className="text-lg font-bold text-green-900">{patient.status}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-sm text-purple-600 font-semibold mb-1">Admitted</p>
              <p className="text-lg font-bold text-purple-900">
                {new Date(patient.admissionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-8 p-6 rounded-2xl border-l-4 ${
              message.includes("successfully")
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            } shadow-lg flex items-center gap-4`}
          >
            {message.includes("successfully") ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
            <p className="font-semibold text-lg">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-green-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {activeTab === "anthropometric" && (
            <AnthropometricTab assessment={assessment} setAssessment={setAssessment} />
          )}
          {activeTab === "biochemical" && (
            <BiochemicalTab assessment={assessment} setAssessment={setAssessment} />
          )}
          {activeTab === "clinical" && (
            <ClinicalTab assessment={assessment} setAssessment={setAssessment} addItem={addItem} removeItem={removeItem} />
          )}
          {activeTab === "dietary" && (
            <DietaryHistoryTab assessment={assessment} setAssessment={setAssessment} addItem={addItem} removeItem={removeItem} />
          )}
          {activeTab === "risk" && (
            <RiskDiagnosisTab assessment={assessment} setAssessment={setAssessment} addItem={addItem} removeItem={removeItem} />
          )}
          {activeTab === "plan" && (
            <CarePlanTab assessment={assessment} setAssessment={setAssessment} addItem={addItem} removeItem={removeItem} />
          )}
        </div>

        <button
          onClick={saveAssessment}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {saving ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving Assessment...
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Nutritional Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AnthropometricTab({ assessment, setAssessment }) {
  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Anthropometric Measurements</h2>
        <p className="text-green-100">Physical measurements and body composition</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Height (cm)</label>
            <input
              type="number"
              value={assessment.anthropometricData.height.value}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                anthropometricData: {
                  ...prev.anthropometricData,
                  height: { ...prev.anthropometricData.height, value: e.target.value }
                }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="170"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Weight (kg)</label>
            <input
              type="number"
              value={assessment.anthropometricData.weight.value}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                anthropometricData: {
                  ...prev.anthropometricData,
                  weight: { ...prev.anthropometricData.weight, value: e.target.value }
                }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="70"
            />
          </div>
        </div>

        {assessment.anthropometricData.bmi > 0 && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Calculated BMI
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-blue-600">{assessment.anthropometricData.bmi}</div>
              <div className="text-blue-700">
                <p className="font-medium">Body Mass Index</p>
                <p className="text-sm">
                  {(() => {
                    const bmi = assessment.anthropometricData.bmi;
                    if (bmi < 18.5) return "Underweight";
                    if (bmi < 25) return "Normal weight";
                    if (bmi < 30) return "Overweight";
                    return "Obese";
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Recent Weight Change</label>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              value={assessment.anthropometricData.recentWeightChange.amount}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                anthropometricData: {
                  ...prev.anthropometricData,
                  recentWeightChange: {
                    ...prev.anthropometricData.recentWeightChange,
                    amount: e.target.value
                  }
                }
              }))}
              className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amount (kg)"
            />
            <input
              type="text"
              value={assessment.anthropometricData.recentWeightChange.timeframe}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                anthropometricData: {
                  ...prev.anthropometricData,
                  recentWeightChange: {
                    ...prev.anthropometricData.recentWeightChange,
                    timeframe: e.target.value
                  }
                }
              }))}
              className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Timeframe (e.g., 3 months)"
            />
            <select
              value={assessment.anthropometricData.recentWeightChange.significance}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                anthropometricData: {
                  ...prev.anthropometricData,
                  recentWeightChange: {
                    ...prev.anthropometricData.recentWeightChange,
                    significance: e.target.value
                  }
                }
              }))}
              className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="None">None</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function BiochemicalTab({ assessment, setAssessment }) {
  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Biochemical Data</h2>
        <p className="text-blue-100">Laboratory values and biochemical markers</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Albumin (g/dL)</label>
            <input
              type="number"
              value={assessment.biochemicalData.albumin}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                biochemicalData: { ...prev.biochemicalData, albumin: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3.5-5.5"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Prealbumin (mg/dL)</label>
            <input
              type="number"
              value={assessment.biochemicalData.prealbumin}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                biochemicalData: { ...prev.biochemicalData, prealbumin: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15-40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Hemoglobin (g/dL)</label>
            <input
              type="number"
              value={assessment.biochemicalData.hemoglobin}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                biochemicalData: { ...prev.biochemicalData, hemoglobin: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12-17"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Glucose (mg/dL)</label>
            <input
              type="number"
              value={assessment.biochemicalData.glucose}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                biochemicalData: { ...prev.biochemicalData, glucose: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="70-100"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Electrolytes</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sodium (mEq/L)</label>
              <input
                type="number"
                value={assessment.biochemicalData.electrolytes.sodium}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  biochemicalData: {
                    ...prev.biochemicalData,
                    electrolytes: { ...prev.biochemicalData.electrolytes, sodium: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="135-145"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Potassium (mEq/L)</label>
              <input
                type="number"
                value={assessment.biochemicalData.electrolytes.potassium}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  biochemicalData: {
                    ...prev.biochemicalData,
                    electrolytes: { ...prev.biochemicalData.electrolytes, potassium: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3.5-5.0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chloride (mEq/L)</label>
              <input
                type="number"
                value={assessment.biochemicalData.electrolytes.chloride}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  biochemicalData: {
                    ...prev.biochemicalData,
                    electrolytes: { ...prev.biochemicalData.electrolytes, chloride: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="95-105"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Calcium (mg/dL)</label>
              <input
                type="number"
                value={assessment.biochemicalData.electrolytes.calcium}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  biochemicalData: {
                    ...prev.biochemicalData,
                    electrolytes: { ...prev.biochemicalData.electrolytes, calcium: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8.5-10.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicalTab({ assessment, setAssessment, addItem, removeItem }) {
  const [newMedHistory, setNewMedHistory] = useState("");
  const [newMedication, setNewMedication] = useState("");

  return (
    <div>
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Clinical Data</h2>
        <p className="text-red-100">Medical history and clinical observations</p>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Primary Diagnosis</label>
          <textarea
            value={assessment.clinicalData.diagnosis}
            onChange={(e) => setAssessment(prev => ({
              ...prev,
              clinicalData: { ...prev.clinicalData, diagnosis: e.target.value }
            }))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows="2"
            placeholder="Enter primary diagnosis..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Medical History</label>
          <div className="space-y-2 mb-3">
            {assessment.clinicalData.medicalHistory.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  readOnly
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={() => removeItem("clinicalData.medicalHistory", index)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMedHistory}
              onChange={(e) => setNewMedHistory(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Add medical history..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && newMedHistory.trim()) {
                  addItem("clinicalData.medicalHistory", newMedHistory);
                  setNewMedHistory("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newMedHistory.trim()) {
                  addItem("clinicalData.medicalHistory", newMedHistory);
                  setNewMedHistory("");
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Current Medications</label>
          <div className="space-y-2 mb-3">
            {assessment.clinicalData.currentMedications.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  readOnly
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={() => removeItem("clinicalData.currentMedications", index)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Add medication..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && newMedication.trim()) {
                  addItem("clinicalData.currentMedications", newMedication);
                  setNewMedication("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newMedication.trim()) {
                  addItem("clinicalData.currentMedications", newMedication);
                  setNewMedication("");
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Functional Status</label>
          <select
            value={assessment.clinicalData.functionalStatus}
            onChange={(e) => setAssessment(prev => ({
              ...prev,
              clinicalData: { ...prev.clinicalData, functionalStatus: e.target.value }
            }))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Independent">Independent</option>
            <option value="Requires Assistance">Requires Assistance</option>
            <option value="Dependent">Dependent</option>
            <option value="Bedridden">Bedridden</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.clinicalData.pressureUlcers}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                clinicalData: { ...prev.clinicalData, pressureUlcers: e.target.checked }
              }))}
              className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
            />
            <span className="font-semibold text-gray-700">Pressure Ulcers</span>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.clinicalData.edema}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                clinicalData: { ...prev.clinicalData, edema: e.target.checked }
              }))}
              className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
            />
            <span className="font-semibold text-gray-700">Edema</span>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.clinicalData.dehydration}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                clinicalData: { ...prev.clinicalData, dehydration: e.target.checked }
              }))}
              className="w-5 h-5 text-red-600 focus:ring-red-500 rounded"
            />
            <span className="font-semibold text-gray-700">Dehydration</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function DietaryHistoryTab({ assessment, setAssessment, addItem, removeItem }) {
  const [newAllergy, setNewAllergy] = useState("");
  const [newIntolerance, setNewIntolerance] = useState("");

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Dietary History</h2>
        <p className="text-orange-100">Usual intake patterns and dietary concerns</p>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Usual Intake</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breakfast</label>
              <textarea
                value={assessment.dietaryHistory.usualIntake.breakfast}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  dietaryHistory: {
                    ...prev.dietaryHistory,
                    usualIntake: { ...prev.dietaryHistory.usualIntake, breakfast: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="2"
                placeholder="Typical breakfast..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lunch</label>
              <textarea
                value={assessment.dietaryHistory.usualIntake.lunch}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  dietaryHistory: {
                    ...prev.dietaryHistory,
                    usualIntake: { ...prev.dietaryHistory.usualIntake, lunch: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="2"
                placeholder="Typical lunch..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dinner</label>
              <textarea
                value={assessment.dietaryHistory.usualIntake.dinner}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  dietaryHistory: {
                    ...prev.dietaryHistory,
                    usualIntake: { ...prev.dietaryHistory.usualIntake, dinner: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="2"
                placeholder="Typical dinner..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Snacks</label>
              <textarea
                value={assessment.dietaryHistory.usualIntake.snacks}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  dietaryHistory: {
                    ...prev.dietaryHistory,
                    usualIntake: { ...prev.dietaryHistory.usualIntake, snacks: e.target.value }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="2"
                placeholder="Typical snacks..."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Appetite Level</label>
          <select
            value={assessment.dietaryHistory.appetiteLevel}
            onChange={(e) => setAssessment(prev => ({
              ...prev,
              dietaryHistory: { ...prev.dietaryHistory, appetiteLevel: e.target.value }
            }))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.dietaryHistory.difficultyChewing}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                dietaryHistory: { ...prev.dietaryHistory, difficultyChewing: e.target.checked }
              }))}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
            />
            <span className="font-semibold text-gray-700">Difficulty Chewing</span>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.dietaryHistory.difficultySwallowing}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                dietaryHistory: { ...prev.dietaryHistory, difficultySwallowing: e.target.checked }
              }))}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
            />
            <span className="font-semibold text-gray-700">Difficulty Swallowing</span>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={assessment.dietaryHistory.nauseaVomiting}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                dietaryHistory: { ...prev.dietaryHistory, nauseaVomiting: e.target.checked }
              }))}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
            />
            <span className="font-semibold text-gray-700">Nausea/Vomiting</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Food Allergies</label>
          <div className="space-y-2 mb-3">
            {assessment.dietaryHistory.foodAllergies.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  readOnly
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={() => removeItem("dietaryHistory.foodAllergies", index)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add food allergy..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && newAllergy.trim()) {
                  addItem("dietaryHistory.foodAllergies", newAllergy);
                  setNewAllergy("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newAllergy.trim()) {
                  addItem("dietaryHistory.foodAllergies", newAllergy);
                  setNewAllergy("");
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Food Intolerances</label>
          <div className="space-y-2 mb-3">
            {assessment.dietaryHistory.foodIntolerances.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  readOnly
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={() => removeItem("dietaryHistory.foodIntolerances", index)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIntolerance}
              onChange={(e) => setNewIntolerance(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add food intolerance..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && newIntolerance.trim()) {
                  addItem("dietaryHistory.foodIntolerances", newIntolerance);
                  setNewIntolerance("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newIntolerance.trim()) {
                  addItem("dietaryHistory.foodIntolerances", newIntolerance);
                  setNewIntolerance("");
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskDiagnosisTab({ assessment, setAssessment, addItem, removeItem }) {
  const [newRiskFactor, setNewRiskFactor] = useState("");

  return (
    <div>
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Nutritional Risk & Diagnosis</h2>
        <p className="text-yellow-100">Risk screening and nutritional diagnoses</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Screening Tool</label>
            <select
              value={assessment.nutritionalRisk.screeningTool}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                nutritionalRisk: { ...prev.nutritionalRisk, screeningTool: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="MUST">MUST</option>
              <option value="NRS-2002">NRS-2002</option>
              <option value="MNA">MNA</option>
              <option value="SGA">SGA</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Risk Score</label>
            <input
              type="number"
              value={assessment.nutritionalRisk.score}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                nutritionalRisk: { ...prev.nutritionalRisk, score: parseInt(e.target.value) || 0 }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Risk Level</label>
            <select
              value={assessment.nutritionalRisk.riskLevel}
              onChange={(e) => setAssessment(prev => ({
                ...prev,
                nutritionalRisk: { ...prev.nutritionalRisk, riskLevel: e.target.value }
              }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Risk Factors</label>
          <div className="space-y-2 mb-3">
            {assessment.nutritionalRisk.riskFactors.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  readOnly
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
                <button
                  onClick={() => removeItem("nutritionalRisk.riskFactors", index)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRiskFactor}
              onChange={(e) => setNewRiskFactor(e.target.value)}
              className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Add risk factor..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && newRiskFactor.trim()) {
                  addItem("nutritionalRisk.riskFactors", newRiskFactor);
                  setNewRiskFactor("");
                }
              }}
            />
            <button
              onClick={() => {
                if (newRiskFactor.trim()) {
                  addItem("nutritionalRisk.riskFactors", newRiskFactor);
                  setNewRiskFactor("");
                }
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nutritional Diagnoses</h3>
            <button
              onClick={() => addItem("nutritionalDiagnosis", {
                problem: "",
                etiology: "",
                signsSymptoms: "",
                priority: "Medium"
              })}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700"
            >
              <Plus className="w-4 h-4" />
              Add Diagnosis
            </button>
          </div>

          <div className="space-y-4">
            {assessment.nutritionalDiagnosis.map((diagnosis, index) => (
              <div key={index} className="p-4 border-2 border-yellow-200 rounded-xl bg-yellow-50">
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Problem</label>
                    <input
                      type="text"
                      value={diagnosis.problem}
                      onChange={(e) => {
                        const updated = [...assessment.nutritionalDiagnosis];
                        updated[index].problem = e.target.value;
                        setAssessment(prev => ({ ...prev, nutritionalDiagnosis: updated }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Nutritional problem..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={diagnosis.priority}
                      onChange={(e) => {
                        const updated = [...assessment.nutritionalDiagnosis];
                        updated[index].priority = e.target.value;
                        setAssessment(prev => ({ ...prev, nutritionalDiagnosis: updated }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Etiology</label>
                  <input
                    type="text"
                    value={diagnosis.etiology}
                    onChange={(e) => {
                      const updated = [...assessment.nutritionalDiagnosis];
                      updated[index].etiology = e.target.value;
                      setAssessment(prev => ({ ...prev, nutritionalDiagnosis: updated }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Related to..."
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Signs & Symptoms</label>
                  <textarea
                    value={diagnosis.signsSymptoms}
                    onChange={(e) => {
                      const updated = [...assessment.nutritionalDiagnosis];
                      updated[index].signsSymptoms = e.target.value;
                      setAssessment(prev => ({ ...prev, nutritionalDiagnosis: updated }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows="2"
                    placeholder="As evidenced by..."
                  />
                </div>

                <button
                  onClick={() => removeItem("nutritionalDiagnosis", index)}
                  className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  Remove Diagnosis
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarePlanTab({ assessment, setAssessment, addItem, removeItem }) {
  return (
    <div>
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Nutritional Care Plan</h2>
        <p className="text-purple-100">Goals, interventions, and recommendations</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Recommended Diet Type</label>
            <select
              value={assessment.recommendedDietType}
              onChange={(e) => setAssessment(prev => ({ ...prev, recommendedDietType: e.target.value }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Regular">Regular</option>
              <option value="Soft">Soft</option>
              <option value="Liquid">Liquid</option>
              <option value="Full Liquid">Full Liquid</option>
              <option value="Clear Liquid">Clear Liquid</option>
              <option value="Pureed">Pureed</option>
              <option value="Low Sodium">Low Sodium</option>
              <option value="Low Fat">Low Fat</option>
              <option value="Diabetic">Diabetic</option>
              <option value="Renal">Renal</option>
              <option value="Cardiac">Cardiac</option>
              <option value="High Protein">High Protein</option>
              <option value="Low Protein">Low Protein</option>
              <option value="Gluten Free">Gluten Free</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="NPO">NPO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Texture</label>
            <select
              value={assessment.recommendedTexture}
              onChange={(e) => setAssessment(prev => ({ ...prev, recommendedTexture: e.target.value }))}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Regular">Regular</option>
              <option value="Minced">Minced</option>
              <option value="Pureed">Pureed</option>
              <option value="Liquid">Liquid</option>
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Energy & Protein Requirements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Energy (kcal/day)</label>
              <input
                type="number"
                value={assessment.energyProteinRequirements.estimatedEnergyRequirement.value}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  energyProteinRequirements: {
                    ...prev.energyProteinRequirements,
                    estimatedEnergyRequirement: {
                      ...prev.energyProteinRequirements.estimatedEnergyRequirement,
                      value: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g/day)</label>
              <input
                type="number"
                value={assessment.energyProteinRequirements.estimatedProteinRequirement.value}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  energyProteinRequirements: {
                    ...prev.energyProteinRequirements,
                    estimatedProteinRequirement: {
                      ...prev.energyProteinRequirements.estimatedProteinRequirement,
                      value: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="75"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fluids (ml/day)</label>
              <input
                type="number"
                value={assessment.energyProteinRequirements.fluidRequirement.value}
                onChange={(e) => setAssessment(prev => ({
                  ...prev,
                  energyProteinRequirements: {
                    ...prev.energyProteinRequirements,
                    fluidRequirement: {
                      ...prev.energyProteinRequirements.fluidRequirement,
                      value: e.target.value
                    }
                  }
                }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Dietician Notes</label>
          <textarea
            value={assessment.dieticianNotes}
            onChange={(e) => setAssessment(prev => ({ ...prev, dieticianNotes: e.target.value }))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="4"
            placeholder="Assessment notes and observations..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Recommendations for Care Team</label>
          <textarea
            value={assessment.recommendationsForTeam}
            onChange={(e) => setAssessment(prev => ({ ...prev, recommendationsForTeam: e.target.value }))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="4"
            placeholder="Recommendations and action items for the care team..."
          />
        </div>
      </div>
    </div>
  );
}

export default withAuth(NutritionalAssessmentPage, ["dietician", "admin"]);
