"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  AlertTriangle, 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  Activity, 
  Send,
  CheckCircle,
  XCircle,
  Navigation,
  Radio,
  Heart
} from "lucide-react";

function DispatchDashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetchEmergencies();
    fetchAmbulances();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchEmergencies();
      fetchAmbulances();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await fetch("/api/emergency/list");
      const data = await res.json();
      if (res.ok) {
        setEmergencies(data.emergencies);
      }
    } catch (error) {
      setMessage("Error fetching emergencies");
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulances = async () => {
    try {
      const res = await fetch("/api/ambulances");
      const data = await res.json();
      if (res.ok) {
        setAmbulances(data.ambulances);
      }
    } catch (error) {
      console.error("Error fetching ambulances");
    }
  };

  const dispatchAmbulance = async (emergencyId, ambulanceId) => {
    try {
      const res = await fetch("/api/emergency/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId, ambulanceId }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchEmergencies();
        fetchAmbulances();
        setSelectedEmergency(null);
      }
    } catch (error) {
      setMessage("Error dispatching ambulance");
    }
  };

  const updateEmergencyStatus = async (emergencyId, status) => {
    try {
      const res = await fetch("/api/emergency/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId, status }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchEmergencies();
        setMessage(`Emergency status updated to ${status}`);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating status");
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
      "Reported": "bg-blue-100 text-blue-700 border-blue-200",
      "Dispatched": "bg-purple-100 text-purple-700 border-purple-200",
      "En Route": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "On Scene": "bg-orange-100 text-orange-700 border-orange-200",
      "Transporting": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Completed": "bg-green-100 text-green-700 border-green-200",
      "Cancelled": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const filteredEmergencies = emergencies.filter(emergency => {
    if (filter === "active") return !["Completed", "Cancelled"].includes(emergency.status);
    if (filter === "pending") return emergency.status === "Reported";
    if (filter === "dispatched") return ["Dispatched", "En Route", "On Scene", "Transporting"].includes(emergency.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading dispatch dashboard...</p>
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
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center shadow-lg">
                <Radio className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Emergency Dispatch</h1>
                <p className="text-gray-600 text-xl">Coordinate emergency response and ambulance dispatch</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{emergencies.filter(e => e.status === "Reported").length}</div>
                <div className="text-sm text-red-600">Pending Dispatch</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{emergencies.filter(e => ["Dispatched", "En Route", "On Scene", "Transporting"].includes(e.status)).length}</div>
                <div className="text-sm text-blue-600">Active Responses</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{ambulances.filter(a => a.status === "Available").length}</div>
                <div className="text-sm text-green-600">Available Units</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{emergencies.filter(e => e.priority === "Critical").length}</div>
                <div className="text-sm text-orange-600">Critical Cases</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "active", label: "Active Emergencies", count: emergencies.filter(e => !["Completed", "Cancelled"].includes(e.status)).length },
              { key: "pending", label: "Pending Dispatch", count: emergencies.filter(e => e.status === "Reported").length },
              { key: "dispatched", label: "Dispatched Units", count: emergencies.filter(e => ["Dispatched", "En Route", "On Scene", "Transporting"].includes(e.status)).length },
              { key: "all", label: "All Emergencies", count: emergencies.length }
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Emergency Incidents</h2>
                <p className="text-red-100">Click on an emergency to view details and dispatch</p>
              </div>

              <div className="p-6">
                {filteredEmergencies.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Emergencies</h3>
                    <p className="text-gray-600">No emergencies match the current filter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEmergencies.map((emergency) => (
                      <div
                        key={emergency._id}
                        onClick={() => setSelectedEmergency(emergency)}
                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedEmergency?._id === emergency._id
                            ? "border-red-500 bg-red-50 shadow-lg"
                            : status === "Cancelled" 
                              ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              : status === "Completed"
                              ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{emergency.incidentNumber}</h3>
                            <p className="text-gray-600">{emergency.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(emergency.priority)}`}>
                              {emergency.priority === "Critical" && <Heart className="w-3 h-3" />}
                              {emergency.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(emergency.status)}`}>
                              {emergency.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span>{emergency.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{new Date(emergency.reportedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-green-500" />
                            <span>{emergency.patientName || "Unknown Patient"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <span>{emergency.callerPhone}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                          <p className="text-gray-700 text-sm">{emergency.patientCondition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Details & Dispatch */}
          <div className="space-y-8">
            {selectedEmergency ? (
              <>
                {/* Emergency Details */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h2 className="text-xl font-bold">Emergency Details</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Patient Information</h3>
                      <p className="text-gray-600">{selectedEmergency.patientName || "Unknown"}, {selectedEmergency.patientAge ? `${selectedEmergency.patientAge} years` : "Age unknown"}</p>
                      <p className="text-gray-600">{selectedEmergency.patientGender || "Gender unknown"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Condition</h3>
                      <p className="text-gray-600">{selectedEmergency.patientCondition}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Location</h3>
                      <p className="text-gray-600">{selectedEmergency.address}</p>
                      {selectedEmergency.landmarks && (
                        <p className="text-gray-500 text-sm">Landmarks: {selectedEmergency.landmarks}</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Caller</h3>
                      <p className="text-gray-600">{selectedEmergency.callerName} ({selectedEmergency.callerPhone})</p>
                      {selectedEmergency.callerRelation && (
                        <p className="text-gray-500 text-sm">Relation: {selectedEmergency.callerRelation}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch Actions */}
                {selectedEmergency.status === "Reported" && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                      <h2 className="text-xl font-bold">Dispatch Ambulance</h2>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Available Ambulances</h3>
                      <div className="space-y-3">
                        {ambulances.filter(amb => amb.status === "Available").map((ambulance) => (
                          <div key={ambulance._id} className="p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold">{ambulance.callSign}</h4>
                                <p className="text-sm text-gray-600">{ambulance.type}</p>
                                <p className="text-sm text-gray-500">Base: {ambulance.baseStation}</p>
                              </div>
                              <button
                                onClick={() => dispatchAmbulance(selectedEmergency._id, ambulance._id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                Dispatch
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {ambulances.filter(amb => amb.status === "Available").length === 0 && (
                        <p className="text-gray-500 text-center py-4">No ambulances currently available</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Updates */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                    <h2 className="text-xl font-bold">Status Updates</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {["Dispatched", "En Route", "On Scene", "Transporting", "Completed", "Cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateEmergencyStatus(selectedEmergency._id, status)}
                          disabled={selectedEmergency.status === status}
                          className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
                            selectedEmergency.status === status
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
                <AlertTriangle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select an Emergency</h3>
                <p className="text-gray-600">Click on an emergency from the list to view details and dispatch options</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DispatchDashboard, ["admin", "receptionist", "dispatcher"]);