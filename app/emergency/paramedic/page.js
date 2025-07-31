"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Activity, 
  Heart,
  Thermometer,
  Droplets,
  Zap,
  Pill,
  FileText,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  Camera,
  Upload,
  Play,
  Pause,
  Flag,
  Route,
  Timer,
  Signature
} from "lucide-react";

function ParamedicInterface() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
    glucoseLevel: "",
    painScale: ""
  });
  const [treatment, setTreatment] = useState({
    treatment: "",
    medication: "",
    dosage: "",
    route: "",
    response: ""
  });
  const [medicalInfo, setMedicalInfo] = useState({
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: ""
  });
  const [handoverData, setHandoverData] = useState({
    paramedicSummary: "",
    treatmentSummary: "",
    patientConditionOnArrival: "",
    handoverNotes: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchCurrentAssignment();
    // Set up real-time updates
    const interval = setInterval(fetchCurrentAssignment, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentAssignment = async () => {
    try {
      const res = await fetch("/api/emergency/paramedic/assignment");
      const data = await res.json();
      if (res.ok) {
        setCurrentAssignment(data.assignment);
      }
    } catch (error) {
      console.error("Error fetching assignment");
    } finally {
      setLoading(false);
    }
  };

  const acceptDispatch = async () => {
    try {
      const res = await fetch("/api/emergency/paramedic/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId: currentAssignment._id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error accepting dispatch");
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await fetch("/api/emergency/paramedic/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          emergencyId: currentAssignment._id, 
          status 
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error updating status");
    }
  };

  const recordVitals = async () => {
    const requiredFields = Object.values(vitals);
    if (requiredFields.some(field => !field)) {
      setMessage("Please fill in all vital signs");
      return;
    }

    try {
      const res = await fetch("/api/emergency/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...vitals
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        setVitals({
          bloodPressure: "",
          heartRate: "",
          respiratoryRate: "",
          temperature: "",
          oxygenSaturation: "",
          glucoseLevel: "",
          painScale: ""
        });
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error recording vitals");
    }
  };

  const recordTreatment = async () => {
    if (!treatment.treatment) {
      setMessage("Please enter treatment details");
      return;
    }

    try {
      const res = await fetch("/api/emergency/treatment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...treatment
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        setTreatment({
          treatment: "",
          medication: "",
          dosage: "",
          route: "",
          response: ""
        });
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error recording treatment");
    }
  };

  const updateMedicalInfo = async () => {
    try {
      const res = await fetch("/api/emergency/medical-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...medicalInfo
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error updating medical information");
    }
  };

  const beginTransport = async () => {
    try {
      const res = await fetch("/api/emergency/transport/begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId: currentAssignment._id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        updateStatus("Transporting");
      }
    } catch (error) {
      setMessage("Error beginning transport");
    }
  };

  const completeHandover = async () => {
    if (!handoverData.paramedicSummary || !handoverData.patientConditionOnArrival) {
      setMessage("Please fill in required handover information");
      return;
    }

    try {
      const res = await fetch("/api/emergency/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...handoverData
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        updateStatus("Completed");
      }
    } catch (error) {
      setMessage("Error completing handover");
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("emergencyId", currentAssignment._id);
    formData.append("type", type);

    try {
      const res = await fetch("/api/emergency/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error uploading file");
    } finally {
      setUploadingFile(false);
    }
  };

  const openNavigation = () => {
    if (currentAssignment?.address) {
      const address = encodeURIComponent(currentAssignment.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
    }
  };

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentChange = (field, value) => {
    setTreatment(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicalInfoChange = (field, value) => {
    setMedicalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleHandoverChange = (field, value) => {
    setHandoverData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading paramedic interface...</p>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-2xl">
          <Truck className="w-24 h-24 text-gray-300 mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Active Assignment</h1>
          <p className="text-gray-600 text-lg mb-8">
            You currently have no emergency assignments. Please wait for dispatch or contact your supervisor.
          </p>
          <button
            onClick={fetchCurrentAssignment}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "navigation", label: "Navigation", icon: <Navigation className="w-4 h-4" /> },
    { id: "vitals", label: "Vitals", icon: <Heart className="w-4 h-4" /> },
    { id: "treatment", label: "Treatment", icon: <Pill className="w-4 h-4" /> },
    { id: "medical", label: "Medical Info", icon: <FileText className="w-4 h-4" /> },
    { id: "transport", label: "Transport", icon: <Route className="w-4 h-4" /> },
    { id: "handover", label: "Handover", icon: <Flag className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramedic Interface</h1>
                <p className="text-gray-600 text-xl">Emergency Response - {session?.user.name}</p>
              </div>
            </div>
            
            {/* Current Assignment Info */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">
                    {currentAssignment.incidentNumber}
                  </h2>
                  <div className="flex items-center gap-4 text-red-700">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {currentAssignment.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {currentAssignment.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-semibold">Response Time</p>
                  <p className="text-2xl font-bold text-red-800">
                    {currentAssignment.dispatchedAt ? 
                      Math.floor((new Date() - new Date(currentAssignment.dispatchedAt)) / 60000) : 0} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Overview</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-4">Patient Information</h3>
                    <div className="space-y-2 text-blue-800">
                      <p><strong>Name:</strong> {currentAssignment.patientName || "Unknown"}</p>
                      <p><strong>Age:</strong> {currentAssignment.patientAge ? `${currentAssignment.patientAge} years` : "Unknown"}</p>
                      <p><strong>Gender:</strong> {currentAssignment.patientGender || "Unknown"}</p>
                      <p><strong>Condition:</strong> {currentAssignment.patientCondition}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4">Location</h3>
                    <div className="space-y-2 text-green-800">
                      <p><strong>Address:</strong> {currentAssignment.address}</p>
                      {currentAssignment.landmarks && (
                        <p><strong>Landmarks:</strong> {currentAssignment.landmarks}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-4">Caller Information</h3>
                    <div className="space-y-2 text-purple-800">
                      <p><strong>Name:</strong> {currentAssignment.callerName}</p>
                      <p><strong>Phone:</strong> {currentAssignment.callerPhone}</p>
                      {currentAssignment.callerRelation && (
                        <p><strong>Relation:</strong> {currentAssignment.callerRelation}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Status Actions</h3>
                    <div className="space-y-3">
                      {currentAssignment.status === "Dispatched" && (
                        <button
                          onClick={acceptDispatch}
                          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Accept Dispatch
                        </button>
                      )}
                      
                      {["En Route", "On Scene", "Transporting"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(status)}
                          disabled={currentAssignment.status === status}
                          className={`w-full p-3 rounded-xl font-semibold transition-all duration-200 ${
                            currentAssignment.status === status
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === "navigation" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Navigation className="w-8 h-8 text-blue-600" />
                Navigation to Incident
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-4">Destination</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-semibold text-blue-900">Incident Location</p>
                          <p className="text-blue-800">{currentAssignment.address}</p>
                          {currentAssignment.landmarks && (
                            <p className="text-blue-700 text-sm mt-1">
                              <strong>Landmarks:</strong> {currentAssignment.landmarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={openNavigation}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <Navigation className="w-6 h-6" />
                      Open Google Maps Navigation
                    </button>
                    
                    <button
                      onClick={() => updateStatus("On Scene")}
                      disabled={currentAssignment.status === "On Scene" || currentAssignment.status === "Transporting"}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Flag className="w-6 h-6" />
                      Mark &quot;On Scene&quot;
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Live Map</h3>
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Interactive map would be displayed here</p>
                      <p className="text-sm">Integration with Google Maps API</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === "vitals" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-600" />
                Record Vital Signs
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { key: "bloodPressure", label: "Blood Pressure", icon: <Heart className="w-5 h-5" />, unit: "mmHg", placeholder: "120/80", color: "red" },
                  { key: "heartRate", label: "Heart Rate", icon: <Activity className="w-5 h-5" />, unit: "bpm", placeholder: "72", color: "pink" },
                  { key: "respiratoryRate", label: "Respiratory Rate", icon: <Activity className="w-5 h-5" />, unit: "/min", placeholder: "16", color: "blue" },
                  { key: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", placeholder: "36.5", color: "orange" },
                  { key: "oxygenSaturation", label: "Oxygen Saturation", icon: <Droplets className="w-5 h-5" />, unit: "%", placeholder: "98", color: "cyan" },
                  { key: "glucoseLevel", label: "Glucose Level", icon: <Zap className="w-5 h-5" />, unit: "mg/dL", placeholder: "100", color: "yellow" },
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
                        onChange={(e) => handleVitalChange(vital.key, e.target.value)}
                        className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {vital.unit}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pain Scale (0-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={vitals.painScale}
                    onChange={(e) => handleVitalChange('painScale', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>No Pain (0)</span>
                    <span className="font-semibold">{vitals.painScale || 0}</span>
                    <span>Severe Pain (10)</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={recordVitals}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-200"
              >
                Record Vital Signs
              </button>
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === "treatment" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Pill className="w-8 h-8 text-purple-600" />
                Record Treatment
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment/Intervention</label>
                  <textarea
                    placeholder="Describe treatment provided..."
                    value={treatment.treatment}
                    onChange={(e) => handleTreatmentChange('treatment', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medication</label>
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={treatment.medication}
                    onChange={(e) => handleTreatmentChange('medication', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
                  <input
                    type="text"
                    placeholder="Dosage amount"
                    value={treatment.dosage}
                    onChange={(e) => handleTreatmentChange('dosage', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Route</label>
                  <select
                    value={treatment.route}
                    onChange={(e) => handleTreatmentChange('route', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select route</option>
                    <option value="Oral">Oral</option>
                    <option value="IV">Intravenous</option>
                    <option value="IM">Intramuscular</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Response</label>
                  <textarea
                    placeholder="Patient's response to treatment..."
                    value={treatment.response}
                    onChange={(e) => handleTreatmentChange('response', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="2"
                  />
                </div>
              </div>
              
              <button
                onClick={recordTreatment}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                Record Treatment
              </button>
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === "medical" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                Medical Information & Documentation
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
                    <textarea
                      placeholder="Current symptoms observed..."
                      value={medicalInfo.symptoms}
                      onChange={(e) => handleMedicalInfoChange('symptoms', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                    <textarea
                      placeholder="Known medical history..."
                      value={medicalInfo.medicalHistory}
                      onChange={(e) => handleMedicalInfoChange('medicalHistory', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                    <textarea
                      placeholder="Known allergies..."
                      value={medicalInfo.allergies}
                      onChange={(e) => handleMedicalInfoChange('allergies', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                    <textarea
                      placeholder="Current medications..."
                      value={medicalInfo.currentMedications}
                      onChange={(e) => handleMedicalInfoChange('currentMedications', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Incident Photos
                  </h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], "photo")}
                    className="w-full p-3 border-2 border-blue-200 rounded-xl bg-white"
                    disabled={uploadingFile}
                  />
                  <p className="text-blue-700 text-sm mt-2">Upload incident or patient photos</p>
                </div>
                
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Medical Reports
                  </h3>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => handleFileUpload(e.target.files[0], "document")}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl bg-white"
                    disabled={uploadingFile}
                  />
                  <p className="text-purple-700 text-sm mt-2">Upload ECG, documents, or reports</p>
                </div>
              </div>
              
              <button
                onClick={updateMedicalInfo}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                Save Medical Information
              </button>
            </div>
          )}

          {/* Transport Tab */}
          {activeTab === "transport" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Route className="w-8 h-8 text-indigo-600" />
                Patient Transport
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-900 mb-4">Transport Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-800">Current Status:</span>
                        <span className="font-semibold text-indigo-900">{currentAssignment.status}</span>
                      </div>
                      
                      {currentAssignment.transportProgress?.started && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-800">Transport Started:</span>
                            <span className="font-semibold text-indigo-900">
                              {new Date(currentAssignment.transportProgress.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-800">ETA:</span>
                            <span className="font-semibold text-indigo-900">
                              {currentAssignment.transportProgress.estimatedArrival ? 
                                new Date(currentAssignment.transportProgress.estimatedArrival).toLocaleTimeString() : 
                                "Calculating..."
                              }
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {currentAssignment.status === "On Scene" && (
                    <button
                      onClick={beginTransport}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <Play className="w-6 h-6" />
                      Begin Transport
                    </button>
                  )}
                </div>
                
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Progress Tracking</h3>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                        style={{ 
                          width: currentAssignment.status === "Completed" ? "100%" :
                                 currentAssignment.status === "Transporting" ? "75%" :
                                 currentAssignment.status === "On Scene" ? "50%" :
                                 currentAssignment.status === "En Route" ? "25%" : "0%"
                        }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["En Route", "On Scene", "Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>En Route</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["On Scene", "Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>On Scene</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>Transport</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          currentAssignment.status === "Completed" ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>Hospital</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Handover Tab */}
          {activeTab === "handover" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Flag className="w-8 h-8 text-orange-600" />
                Patient Handover
              </h2>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paramedic Summary *</label>
                  <textarea
                    placeholder="Summary of response and care provided..."
                    value={handoverData.paramedicSummary}
                    onChange={(e) => handleHandoverChange('paramedicSummary', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Summary</label>
                  <textarea
                    placeholder="Summary of treatments administered..."
                    value={handoverData.treatmentSummary}
                    onChange={(e) => handleHandoverChange('treatmentSummary', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Condition on Arrival *</label>
                  <textarea
                    placeholder="Current patient condition and status..."
                    value={handoverData.patientConditionOnArrival}
                    onChange={(e) => handleHandoverChange('patientConditionOnArrival', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Handover Notes</label>
                  <textarea
                    placeholder="Any additional notes for receiving staff..."
                    value={handoverData.handoverNotes}
                    onChange={(e) => handleHandoverChange('handoverNotes', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Signature className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Digital Handover</h3>
                </div>
                <p className="text-orange-800 text-sm">
                  By completing this handover, you confirm that all patient care has been transferred to the receiving medical staff.
                  This action will mark the emergency response as complete.
                </p>
              </div>
              
              <button
                onClick={completeHandover}
                disabled={currentAssignment.status !== "Transporting"}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flag className="w-6 h-6" />
                Complete Handover
              </button>
            </div>
          )}
        </div>

        {/* Previous Records */}
        {(currentAssignment.vitalSigns?.length > 0 || currentAssignment.treatments?.length > 0) && (
          <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Previous Records
              </h2>
            </div>
            <div className="p-6">
              {currentAssignment.vitalSigns?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Vital Signs History</h3>
                  <div className="space-y-3">
                    {currentAssignment.vitalSigns.map((vital, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(vital.timestamp).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            Pain: {vital.painScale}/10
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <span>BP: {vital.bloodPressure}</span>
                          <span>HR: {vital.heartRate}</span>
                          <span>SpO2: {vital.oxygenSaturation}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentAssignment.treatments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Treatment History</h3>
                  <div className="space-y-3">
                    {currentAssignment.treatments.map((treat, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{treat.treatment}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(treat.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {treat.medication && (
                          <p className="text-sm text-gray-600">
                            {treat.medication} - {treat.dosage} ({treat.route})
                          </p>
                        )}
                        {treat.response && (
                          <p className="text-sm text-gray-700 mt-2">Response: {treat.response}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ParamedicInterface, ["nurse", "doctor", "dispatcher"]);