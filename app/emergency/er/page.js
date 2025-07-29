"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Activity, 
  Clock, 
  User, 
  MapPin, 
  Heart,
  AlertTriangle,
  Truck,
  Phone,
  FileText,
  Thermometer,
  Droplets,
  Zap,
  Calendar,
  CheckCircle
} from "lucide-react";

function ERStaffPortal() {
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [currentPatients, setCurrentPatients] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("incoming");

  useEffect(() => {
    fetchERData();
    // Set up real-time updates
    const interval = setInterval(fetchERData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchERData = async () => {
    try {
      const res = await fetch("/api/emergency/er");
      const data = await res.json();
      if (res.ok) {
        setIncomingPatients(data.incoming || []);
        setCurrentPatients(data.current || []);
      }
    } catch (error) {
      setMessage("Error fetching ER data");
    } finally {
      setLoading(false);
    }
  };

  const acknowledgePatient = async (emergencyId) => {
    try {
      const res = await fetch("/api/emergency/er/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchERData();
      }
    } catch (error) {
      setMessage("Error acknowledging patient");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Transporting": "bg-blue-100 text-blue-700 border-blue-200",
      "Arrived": "bg-green-100 text-green-700 border-green-200",
      "In Treatment": "bg-purple-100 text-purple-700 border-purple-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const calculateETA = (transportStarted) => {
    if (!transportStarted) return "Unknown";
    const now = new Date();
    const started = new Date(transportStarted);
    const elapsed = Math.floor((now - started) / 60000); // minutes
    const eta = Math.max(0, 15 - elapsed); // Assume 15 min transport time
    return eta > 0 ? `${eta} min` : "Arriving";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading ER portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">ER Staff Portal</h1>
                <p className="text-gray-600 text-xl">Emergency Department Patient Management</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{incomingPatients.length}</div>
                <div className="text-sm text-blue-600">Incoming</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{currentPatients.length}</div>
                <div className="text-sm text-green-600">In Treatment</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {[...incomingPatients, ...currentPatients].filter(p => p.priority === "Critical").length}
                </div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {incomingPatients.filter(p => p.status === "Transporting").length}
                </div>
                <div className="text-sm text-purple-600">En Route</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "incoming", label: "Incoming Patients", count: incomingPatients.length },
              { key: "current", label: "Current Patients", count: currentPatients.length },
              { key: "all", label: "All Patients", count: incomingPatients.length + currentPatients.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Patient Lists */}
        {(filter === "incoming" || filter === "all") && (
          <div className="mb-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Truck className="w-8 h-8" />
                  Incoming Patients
                </h2>
                <p className="text-blue-100">Patients being transported to the ER</p>
              </div>

              <div className="p-6">
                {incomingPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Incoming Patients</h3>
                    <p className="text-gray-600">No patients are currently being transported</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {incomingPatients.map((patient) => (
                      <div key={patient._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {patient.patientName?.charAt(0) || "?"}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{patient.incidentNumber}</h3>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(patient.priority)}`}>
                                  {patient.priority === "Critical" && <Heart className="w-4 h-4" />}
                                  {patient.priority}
                                </span>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(patient.status)}`}>
                                  {patient.status}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="w-4 h-4 text-green-500" />
                                  <span>{patient.patientName || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span>ETA: {calculateETA(patient.transportStartedAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-purple-500" />
                                  <span>{patient.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-4 h-4 text-orange-500" />
                                  <span>{patient.callerPhone}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => acknowledgePatient(patient._id)}
                              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Acknowledge
                            </button>
                          </div>
                        </div>

                        {/* Patient Condition */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-semibold text-gray-800 mb-2">Condition</h4>
                          <p className="text-gray-700">{patient.patientCondition}</p>
                          {patient.chiefComplaint && (
                            <p className="text-gray-600 mt-2">Chief Complaint: {patient.chiefComplaint}</p>
                          )}
                        </div>

                        {/* Latest Vitals */}
                        {patient.vitalSigns?.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                              <Activity className="w-5 h-5" />
                              Latest Vitals ({new Date(patient.vitalSigns[patient.vitalSigns.length - 1].timestamp).toLocaleTimeString()})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {[
                                { label: "BP", value: patient.vitalSigns[patient.vitalSigns.length - 1].bloodPressure, icon: <Heart className="w-4 h-4 text-red-500" /> },
                                { label: "HR", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].heartRate} bpm`, icon: <Activity className="w-4 h-4 text-pink-500" /> },
                                { label: "SpO2", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].oxygenSaturation}%`, icon: <Droplets className="w-4 h-4 text-blue-500" /> },
                                { label: "Pain", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].painScale}/10`, icon: <Zap className="w-4 h-4 text-yellow-500" /> }
                              ].map((vital, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 flex items-center gap-2">
                                  {vital.icon}
                                  <div>
                                    <p className="text-xs text-gray-500">{vital.label}</p>
                                    <p className="font-semibold text-gray-800">{vital.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Treatments */}
                        {patient.treatments?.length > 0 && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              Recent Treatments
                            </h4>
                            <div className="space-y-2">
                              {patient.treatments.slice(-2).map((treatment, index) => (
                                <div key={index} className="bg-white rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-purple-900">{treatment.treatment}</span>
                                    <span className="text-xs text-purple-600">
                                      {new Date(treatment.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {treatment.medication && (
                                    <p className="text-sm text-purple-700 mt-1">
                                      {treatment.medication} - {treatment.dosage}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(filter === "current" || filter === "all") && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Current ER Patients
              </h2>
              <p className="text-green-100">Patients currently receiving treatment in the ER</p>
            </div>

            <div className="p-6">
              {currentPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Current Patients</h3>
                  <p className="text-gray-600">No patients are currently in the ER</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {currentPatients.map((patient) => (
                    <div key={patient._id} className="border-2 border-gray-200 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{patient.incidentNumber}</h3>
                          <p className="text-gray-600">{patient.patientName || "Unknown Patient"}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(patient.priority)}`}>
                            {patient.priority}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Arrived: {patient.arrivedHospitalAt ? new Date(patient.arrivedHospitalAt).toLocaleString() : "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{patient.patientAge ? `${patient.patientAge} years` : "Age unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{patient.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ERStaffPortal, ["doctor", "nurse", "admin"]);