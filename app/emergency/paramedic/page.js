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
  Phone
} from "lucide-react";

function ParamedicInterface() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentChange = (field, value) => {
    setTreatment(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <h2 className="text-xl font-bold">Emergency Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patient
                  </h3>
                  <p className="text-gray-600">{currentAssignment.patientName || "Unknown"}</p>
                  <p className="text-gray-500 text-sm">
                    {currentAssignment.patientAge ? `${currentAssignment.patientAge} years` : "Age unknown"} • 
                    {currentAssignment.patientGender || "Gender unknown"}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <p className="text-gray-600">{currentAssignment.address}</p>
                  {currentAssignment.landmarks && (
                    <p className="text-gray-500 text-sm">Landmarks: {currentAssignment.landmarks}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Caller
                  </h3>
                  <p className="text-gray-600">{currentAssignment.callerName}</p>
                  <p className="text-gray-500 text-sm">{currentAssignment.callerPhone}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800">Condition</h3>
                  <p className="text-gray-600">{currentAssignment.patientCondition}</p>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h2 className="text-xl font-bold">Status Updates</h2>
              </div>
              <div className="p-6">
                {currentAssignment.status === "Dispatched" && (
                  <button
                    onClick={acceptDispatch}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-4 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept Dispatch
                  </button>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  {["En Route", "On Scene", "Transporting"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      disabled={currentAssignment.status === status}
                      className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
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

          {/* Medical Documentation */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vital Signs */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Record Vital Signs
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Pressure</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="120/80"
                        value={vitals.bloodPressure}
                        onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate (bpm)</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="72"
                        value={vitals.heartRate}
                        onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Respiratory Rate (/min)</label>
                    <input
                      type="number"
                      placeholder="16"
                      value={vitals.respiratoryRate}
                      onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°C)</label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="36.5"
                        value={vitals.temperature}
                        onChange={(e) => handleVitalChange('temperature', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Oxygen Saturation (%)</label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="98"
                        value={vitals.oxygenSaturation}
                        onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Glucose Level (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={vitals.glucoseLevel}
                      onChange={(e) => handleVitalChange('glucoseLevel', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pain Scale (0-10)</label>
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
            </div>

            {/* Treatment Documentation */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Pill className="w-6 h-6" />
                  Record Treatment
                </h2>
              </div>
              <div className="p-6">
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
            </div>

            {/* Previous Records */}
            {(currentAssignment.vitalSigns?.length > 0 || currentAssignment.treatments?.length > 0) && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
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
      </div>
    </div>
  );
}

export default withAuth(ParamedicInterface, ["nurse", "doctor"]);