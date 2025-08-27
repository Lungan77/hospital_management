"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Users, 
  Activity, 
  Clock, 
  MapPin, 
  Heart,
  AlertTriangle,
  Truck,
  Phone,
  User,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Stethoscope,
  Timer,
  Navigation,
  RefreshCw
} from "lucide-react";

function ERIncomingPatients() {
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchIncomingPatients();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchIncomingPatients();
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncomingPatients = async () => {
    try {
      const res = await fetch("/api/er/incoming");
      const data = await res.json();
      if (res.ok) {
        setIncomingPatients(data.patients || []);
      } else {
        setMessage("Error fetching incoming patients");
      }
    } catch (error) {
      setMessage("Error loading patient data");
    } finally {
      setLoading(false);
    }
  };

  const acknowledgePatient = async (patientId) => {
    try {
      const res = await fetch("/api/er/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId: patientId }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchIncomingPatients();
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
    return eta > 0 ? `${eta} min` : "Arriving Now";
  };

  const filteredPatients = incomingPatients.filter(patient => {
    if (filter === "critical") return patient.priority === "Critical";
    if (filter === "transporting") return patient.status === "Transporting";
    if (filter === "arriving") return patient.status === "Arrived";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading incoming patients...</p>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Incoming Patients</h1>
                  <p className="text-gray-600 text-xl">Emergency patients being transported to the ER</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    fetchIncomingPatients();
                    setLastUpdate(new Date());
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{incomingPatients.length}</div>
                <div className="text-sm text-blue-600">Total Incoming</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {incomingPatients.filter(p => p.priority === "Critical").length}
                </div>
                <div className="text-sm text-red-600">Critical Cases</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {incomingPatients.filter(p => p.status === "Transporting").length}
                </div>
                <div className="text-sm text-orange-600">En Route</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {incomingPatients.filter(p => p.status === "Arrived").length}
                </div>
                <div className="text-sm text-green-600">Arrived</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Incoming", count: incomingPatients.length },
              { key: "critical", label: "Critical", count: incomingPatients.filter(p => p.priority === "Critical").length },
              { key: "transporting", label: "En Route", count: incomingPatients.filter(p => p.status === "Transporting").length },
              { key: "arriving", label: "Arrived", count: incomingPatients.filter(p => p.status === "Arrived").length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-red-600 text-white shadow-lg"
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

        {/* Incoming Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Truck className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Incoming Patients</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No patients are currently being transported to the ER." : `No ${filter} patients found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Patient Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {patient.patientName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{patient.incidentNumber}</h2>
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(patient.priority)}`}>
                            {patient.priority === "Critical" && <Heart className="w-4 h-4" />}
                            {patient.priority}
                          </span>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-green-500" />
                            <span><strong>Patient:</strong> {patient.patientName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span><strong>ETA:</strong> {calculateETA(patient.transportStartedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span><strong>From:</strong> {patient.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => acknowledgePatient(patient._id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Acknowledge Arrival
                      </button>
                      <button
                        onClick={() => window.location.href = `/er/assessment/${patient._id}`}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient Condition */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Patient Condition</h4>
                  <p className="text-gray-700 mb-3">{patient.patientCondition}</p>
                  {patient.chiefComplaint && (
                    <p className="text-gray-600">Chief Complaint: {patient.chiefComplaint}</p>
                  )}
                </div>

                {/* Latest Vitals */}
                {patient.vitalSigns?.length > 0 && (
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Latest Vitals ({new Date(patient.vitalSigns[patient.vitalSigns.length - 1].timestamp).toLocaleTimeString()})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "BP", value: patient.vitalSigns[patient.vitalSigns.length - 1].bloodPressure, icon: <Heart className="w-4 h-4 text-red-500" /> },
                        { label: "HR", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].heartRate} bpm`, icon: <Activity className="w-4 h-4 text-pink-500" /> },
                        { label: "SpO2", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].oxygenSaturation}%`, icon: <Activity className="w-4 h-4 text-blue-500" /> },
                        { label: "Pain", value: `${patient.vitalSigns[patient.vitalSigns.length - 1].painScale}/10`, icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> }
                      ].map((vital, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-2">
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
                  <div className="p-6">
                    <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Treatments
                    </h4>
                    <div className="space-y-3">
                      {patient.treatments.slice(-2).map((treatment, index) => (
                        <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-purple-900">{treatment.treatment}</span>
                            <span className="text-xs text-purple-600">
                              {new Date(treatment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          {treatment.medication && (
                            <p className="text-sm text-purple-700 mt-1">
                              {treatment.medication} - {treatment.dosage} ({treatment.route})
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
  );
}

export default withAuth(ERIncomingPatients, ["er", "doctor", "nurse"]);