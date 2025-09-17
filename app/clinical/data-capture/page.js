"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { 
  Stethoscope, 
  Heart, 
  Activity, 
  User, 
  FileText, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Droplets,
  Zap,
  Brain,
  Weight,
  Ruler,
  Plus,
  Minus,
  Save,
  Eye,
  Edit,
  Calendar,
  Phone,
  MapPin,
  Pill,
  History,
  Search,
  Filter
} from "lucide-react";

function ClinicalDataCapture() {
  const searchParams = useSearchParams();
  const patientAdmissionId = searchParams.get("patientId");
  
  const [patient, setPatient] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [activeTab, setActiveTab] = useState("vitals");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Form states
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    painScale: 0,
    consciousnessLevel: "Alert",
    notes: ""
  });
  
  const [medicalHistory, setMedicalHistory] = useState({
    chronicConditions: [],
    previousSurgeries: [],
    familyHistory: [],
    socialHistory: {
      smoking: "Never",
      alcohol: "Never",
      drugs: "Never",
      occupation: "",
      maritalStatus: ""
    }
  });
  
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [physicalAssessment, setPhysicalAssessment] = useState({
    generalAppearance: "",
    skinCondition: "",
    cardiovascular: "",
    respiratory: "",
    neurological: "",
    gastrointestinal: "",
    genitourinary: "",
    musculoskeletal: ""
  });

  useEffect(() => {
    if (patientAdmissionId) {
      fetchPatientData();
      fetchClinicalData();
    }
  }, [patientAdmissionId]);

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/er/patient/${patientAdmissionId}`);
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
      } else {
        setMessage("Error loading patient data");
      }
    } catch (error) {
      setMessage("Error fetching patient information");
    }
  };

  const fetchClinicalData = async () => {
    try {
      const res = await fetch(`/api/clinical/data/${patientAdmissionId}`);
      const data = await res.json();
      if (res.ok && data.clinicalData) {
        setClinicalData(data.clinicalData);
        // Pre-populate forms with existing data
        if (data.clinicalData.vitalSigns?.length > 0) {
          const latestVitals = data.clinicalData.vitalSigns[data.clinicalData.vitalSigns.length - 1];
          setVitals({
            bloodPressure: latestVitals.bloodPressure || "",
            heartRate: latestVitals.heartRate?.toString() || "",
            temperature: latestVitals.temperature?.toString() || "",
            respiratoryRate: latestVitals.respiratoryRate?.toString() || "",
            oxygenSaturation: latestVitals.oxygenSaturation?.toString() || "",
            weight: latestVitals.weight?.toString() || "",
            height: latestVitals.height?.toString() || "",
            painScale: latestVitals.painScale || 0,
            consciousnessLevel: latestVitals.consciousnessLevel || "Alert",
            notes: ""
          });
        }
        
        if (data.clinicalData.medicalHistory) {
          setMedicalHistory(data.clinicalData.medicalHistory);
        }
        
        if (data.clinicalData.allergies) {
          setAllergies(data.clinicalData.allergies);
        }
        
        if (data.clinicalData.medications) {
          setMedications(data.clinicalData.medications);
        }
        
        if (data.clinicalData.physicalAssessment) {
          setPhysicalAssessment(data.clinicalData.physicalAssessment);
        }
      }
    } catch (error) {
      console.error("Error fetching clinical data");
    } finally {
      setLoading(false);
    }
  };

  const saveVitals = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinical/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId,
          ...vitals,
          heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : null,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          respiratoryRate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : null,
          oxygenSaturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation) : null,
          weight: vitals.weight ? parseFloat(vitals.weight) : null,
          height: vitals.height ? parseFloat(vitals.height) : null,
          painScale: parseInt(vitals.painScale)
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Vital signs recorded successfully");
        fetchClinicalData();
        // Reset vitals form for next entry
        setVitals({
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
          oxygenSaturation: "",
          weight: "",
          height: "",
          painScale: 0,
          consciousnessLevel: "Alert",
          notes: ""
        });
      } else {
        setMessage(data.error || "Error saving vital signs");
      }
    } catch (error) {
      setMessage("Error recording vital signs");
    } finally {
      setSaving(false);
    }
  };

  const saveMedicalHistory = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinical/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId,
          medicalHistory
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Medical history recorded successfully");
        fetchClinicalData();
      } else {
        setMessage(data.error || "Error saving medical history");
      }
    } catch (error) {
      setMessage("Error recording medical history");
    } finally {
      setSaving(false);
    }
  };

  const saveAllergies = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinical/allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId,
          allergies
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Allergies recorded successfully");
        fetchClinicalData();
      } else {
        setMessage(data.error || "Error saving allergies");
      }
    } catch (error) {
      setMessage("Error recording allergies");
    } finally {
      setSaving(false);
    }
  };

  const saveMedications = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinical/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId,
          medications
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Medications recorded successfully");
        fetchClinicalData();
      } else {
        setMessage(data.error || "Error saving medications");
      }
    } catch (error) {
      setMessage("Error recording medications");
    } finally {
      setSaving(false);
    }
  };

  const savePhysicalAssessment = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/clinical/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId,
          physicalAssessment
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Physical assessment recorded successfully");
        fetchClinicalData();
      } else {
        setMessage(data.error || "Error saving physical assessment");
      }
    } catch (error) {
      setMessage("Error recording physical assessment");
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    setAllergies([...allergies, {
      allergen: "",
      reaction: "",
      severity: "Mild",
      dateIdentified: "",
      notes: ""
    }]);
  };

  const updateAllergy = (index, field, value) => {
    const updatedAllergies = [...allergies];
    updatedAllergies[index][field] = value;
    setAllergies(updatedAllergies);
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    setMedications([...medications, {
      name: "",
      dosage: "",
      frequency: "",
      route: "Oral",
      startDate: "",
      prescribedBy: "",
      indication: "",
      notes: ""
    }]);
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const addChronicCondition = () => {
    setMedicalHistory(prev => ({
      ...prev,
      chronicConditions: [...prev.chronicConditions, ""]
    }));
  };

  const updateChronicCondition = (index, value) => {
    const updated = [...medicalHistory.chronicConditions];
    updated[index] = value;
    setMedicalHistory(prev => ({ ...prev, chronicConditions: updated }));
  };

  const removeChronicCondition = (index) => {
    setMedicalHistory(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index)
    }));
  };

  const calculateBMI = () => {
    if (vitals.weight && vitals.height) {
      const weightKg = parseFloat(vitals.weight);
      const heightM = parseFloat(vitals.height) / 100;
      if (weightKg > 0 && heightM > 0) {
        return (weightKg / (heightM * heightM)).toFixed(1);
      }
    }
    return "";
  };

  const getCompletionColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const tabs = [
    { key: "vitals", label: "Vital Signs", icon: <Heart className="w-5 h-5" />, color: "red" },
    { key: "history", label: "Medical History", icon: <History className="w-5 h-5" />, color: "blue" },
    { key: "allergies", label: "Allergies", icon: <AlertTriangle className="w-5 h-5" />, color: "orange" },
    { key: "medications", label: "Medications", icon: <Pill className="w-5 h-5" />, color: "purple" },
    { key: "assessment", label: "Physical Assessment", icon: <Stethoscope className="w-5 h-5" />, color: "green" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading clinical data capture...</p>
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
          <p className="text-gray-600">Unable to load patient information for clinical data capture</p>
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
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Clinical Data Capture</h1>
                  <p className="text-gray-600 text-xl">Comprehensive patient assessment and documentation</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">
                  {clinicalData?.dataCompleteness?.completenessScore || 0}%
                </div>
                <div className="text-gray-600">Complete</div>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-600 text-white shadow-lg transform scale-105`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className={activeTab === tab.key ? "text-white" : `text-${tab.color}-600`}>
                  {tab.icon}
                </span>
                {tab.label}
                {clinicalData?.dataCompleteness && (
                  <span className={`w-3 h-3 rounded-full ${
                    (tab.key === "vitals" && clinicalData.dataCompleteness.vitalsRecorded) ||
                    (tab.key === "history" && clinicalData.dataCompleteness.historyTaken) ||
                    (tab.key === "allergies" && clinicalData.dataCompleteness.allergiesChecked) ||
                    (tab.key === "medications" && clinicalData.dataCompleteness.medicationsRecorded) ||
                    (tab.key === "assessment" && clinicalData.dataCompleteness.physicalExamDone)
                      ? "bg-green-400" : "bg-gray-400"
                  }`}></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Vital Signs Tab */}
          {activeTab === "vitals" && (
            <div>
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Vital Signs Recording</h2>
                <p className="text-red-100">Record patient vital signs and measurements</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {[
                    { key: "bloodPressure", label: "Blood Pressure", icon: <Heart className="w-5 h-5" />, unit: "mmHg", placeholder: "120/80", color: "red" },
                    { key: "heartRate", label: "Heart Rate", icon: <Activity className="w-5 h-5" />, unit: "bpm", placeholder: "72", color: "pink" },
                    { key: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", placeholder: "36.5", color: "orange" },
                    { key: "respiratoryRate", label: "Respiratory Rate", icon: <Activity className="w-5 h-5" />, unit: "/min", placeholder: "16", color: "blue" },
                    { key: "oxygenSaturation", label: "Oxygen Saturation", icon: <Droplets className="w-5 h-5" />, unit: "%", placeholder: "98", color: "cyan" },
                    { key: "weight", label: "Weight", icon: <Weight className="w-5 h-5" />, unit: "kg", placeholder: "70", color: "green" },
                    { key: "height", label: "Height", icon: <Ruler className="w-5 h-5" />, unit: "cm", placeholder: "170", color: "purple" }
                  ].map((vital) => (
                    <div key={vital.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {vital.label}
                      </label>
                      <div className="relative">
                        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-${vital.color}-100 rounded-lg`}>
                          <span className={`text-${vital.color}-600`}>{vital.icon}</span>
                        </div>
                        <input
                          type="text"
                          placeholder={vital.placeholder}
                          value={vitals[vital.key]}
                          onChange={(e) => setVitals(prev => ({ ...prev, [vital.key]: e.target.value }))}
                          className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          {vital.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BMI Calculator */}
                {vitals.weight && vitals.height && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-3">
                      <Zap className="w-6 h-6" />
                      Calculated BMI
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-purple-600">{calculateBMI()}</div>
                      <div className="text-purple-700">
                        <p className="font-medium">Body Mass Index</p>
                        <p className="text-sm">
                          {(() => {
                            const bmi = parseFloat(calculateBMI());
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

                {/* Pain Scale */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pain Scale (0-10)</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={vitals.painScale}
                      onChange={(e) => setVitals(prev => ({ ...prev, painScale: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>No Pain (0)</span>
                      <span className="font-bold text-lg text-red-600">{vitals.painScale}</span>
                      <span>Severe Pain (10)</span>
                    </div>
                  </div>
                </div>

                {/* Consciousness Level */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Consciousness Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Alert", "Verbal", "Pain", "Unresponsive"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setVitals(prev => ({ ...prev, consciousnessLevel: level }))}
                        className={`p-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                          vitals.consciousnessLevel === level
                            ? "border-purple-500 bg-purple-50 text-purple-700 shadow-lg transform scale-105"
                            : "border-gray-200 hover:border-purple-300 text-gray-700"
                        }`}
                      >
                        <Brain className="w-5 h-5 mx-auto mb-1" />
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Clinical Notes</label>
                  <textarea
                    value={vitals.notes}
                    onChange={(e) => setVitals(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    rows="3"
                    placeholder="Additional observations or notes..."
                  />
                </div>

                <button
                  onClick={saveVitals}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Recording Vital Signs...
                    </div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 inline mr-2" />
                      Record Vital Signs
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === "history" && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Medical History</h2>
                <p className="text-blue-100">Document patient's medical background and history</p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Chronic Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Chronic Conditions</h3>
                    <button
                      onClick={addChronicCondition}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>
                  <div className="space-y-3">
                    {medicalHistory.chronicConditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={condition}
                          onChange={(e) => updateChronicCondition(index, e.target.value)}
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter chronic condition..."
                        />
                        <button
                          onClick={() => removeChronicCondition(index)}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social History */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Social History</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking Status</label>
                      <select
                        value={medicalHistory.socialHistory.smoking}
                        onChange={(e) => setMedicalHistory(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, smoking: e.target.value }
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Never">Never</option>
                        <option value="Former">Former Smoker</option>
                        <option value="Current">Current Smoker</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Alcohol Use</label>
                      <select
                        value={medicalHistory.socialHistory.alcohol}
                        onChange={(e) => setMedicalHistory(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, alcohol: e.target.value }
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Never">Never</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Regular">Regular</option>
                        <option value="Heavy">Heavy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                      <input
                        type="text"
                        value={medicalHistory.socialHistory.occupation}
                        onChange={(e) => setMedicalHistory(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, occupation: e.target.value }
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Patient's occupation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                      <select
                        value={medicalHistory.socialHistory.maritalStatus}
                        onChange={(e) => setMedicalHistory(prev => ({
                          ...prev,
                          socialHistory: { ...prev.socialHistory, maritalStatus: e.target.value }
                        }))}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveMedicalHistory}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Medical History"}
                </button>
              </div>
            </div>
          )}

          {/* Allergies Tab */}
          {activeTab === "allergies" && (
            <div>
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Allergies & Adverse Reactions</h2>
                <p className="text-orange-100">Document all known allergies and adverse reactions</p>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Known Allergies</h3>
                  <button
                    onClick={addAllergy}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Allergy
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Allergen</label>
                          <input
                            type="text"
                            value={allergy.allergen}
                            onChange={(e) => updateAllergy(index, "allergen", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g., Penicillin, Peanuts"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reaction</label>
                          <input
                            type="text"
                            value={allergy.reaction}
                            onChange={(e) => updateAllergy(index, "reaction", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g., Rash, Anaphylaxis"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                          <select
                            value={allergy.severity}
                            onChange={(e) => updateAllergy(index, "severity", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                            <option value="Life-threatening">Life-threatening</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeAllergy(index)}
                            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Minus className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveAllergies}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-orange-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Allergies"}
                </button>
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === "medications" && (
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Current Medications</h2>
                <p className="text-purple-100">Record all current medications and prescriptions</p>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Current Medications</h3>
                  <button
                    onClick={addMedication}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medication
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  {medications.map((medication, index) => (
                    <div key={index} className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, "name", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Lisinopril"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., 10mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Once daily"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                          <select
                            value={medication.route}
                            onChange={(e) => updateMedication(index, "route", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Oral">Oral</option>
                            <option value="IV">IV</option>
                            <option value="IM">IM</option>
                            <option value="Sublingual">Sublingual</option>
                            <option value="Topical">Topical</option>
                            <option value="Inhalation">Inhalation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By</label>
                          <input
                            type="text"
                            value={medication.prescribedBy}
                            onChange={(e) => updateMedication(index, "prescribedBy", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Prescribing physician"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Indication</label>
                          <input
                            type="text"
                            value={medication.indication}
                            onChange={(e) => updateMedication(index, "indication", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Reason for medication"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={medication.startDate}
                            onChange={(e) => updateMedication(index, "startDate", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeMedication(index)}
                            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Minus className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveMedications}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Medications"}
                </button>
              </div>
            </div>
          )}

          {/* Physical Assessment Tab */}
          {activeTab === "assessment" && (
            <div>
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Physical Assessment</h2>
                <p className="text-green-100">Comprehensive physical examination findings</p>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    { key: "generalAppearance", label: "General Appearance", placeholder: "Overall appearance and demeanor..." },
                    { key: "skinCondition", label: "Skin Condition", placeholder: "Skin color, temperature, moisture..." },
                    { key: "cardiovascular", label: "Cardiovascular", placeholder: "Heart sounds, rhythm, circulation..." },
                    { key: "respiratory", label: "Respiratory", placeholder: "Breath sounds, respiratory effort..." },
                    { key: "neurological", label: "Neurological", placeholder: "Mental status, reflexes, motor function..." },
                    { key: "gastrointestinal", label: "Gastrointestinal", placeholder: "Abdomen, bowel sounds..." },
                    { key: "genitourinary", label: "Genitourinary", placeholder: "Urinary function, output..." },
                    { key: "musculoskeletal", label: "Musculoskeletal", placeholder: "Range of motion, strength..." }
                  ].map((assessment) => (
                    <div key={assessment.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {assessment.label}
                      </label>
                      <textarea
                        value={physicalAssessment[assessment.key]}
                        onChange={(e) => setPhysicalAssessment(prev => ({ 
                          ...prev, 
                          [assessment.key]: e.target.value 
                        }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                        rows="3"
                        placeholder={assessment.placeholder}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={savePhysicalAssessment}
                  disabled={saving}
                  className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Physical Assessment"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Completeness Summary */}
        {clinicalData && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Data Completeness Summary
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Vitals", completed: clinicalData.dataCompleteness?.vitalsRecorded, icon: <Heart className="w-5 h-5" /> },
                { label: "History", completed: clinicalData.dataCompleteness?.historyTaken, icon: <History className="w-5 h-5" /> },
                { label: "Allergies", completed: clinicalData.dataCompleteness?.allergiesChecked, icon: <AlertTriangle className="w-5 h-5" /> },
                { label: "Medications", completed: clinicalData.dataCompleteness?.medicationsRecorded, icon: <Pill className="w-5 h-5" /> },
                { label: "Assessment", completed: clinicalData.dataCompleteness?.physicalExamDone, icon: <Stethoscope className="w-5 h-5" /> }
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
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Overall Completion</p>
                  <p className="text-blue-700 text-sm">Clinical data capture progress</p>
                </div>
                <div className={`text-3xl font-bold ${getCompletionColor(clinicalData.dataCompleteness?.completenessScore || 0)}`}>
                  {clinicalData.dataCompleteness?.completenessScore || 0}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ClinicalDataCapture, ["nurse", "doctor"]);