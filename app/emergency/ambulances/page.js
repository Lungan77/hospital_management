"use client"

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Truck, 
  MapPin, 
  Activity, 
  Users, 
  Wrench, 
  Radio, 
  Fuel, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Navigation,
  Phone,
  Settings,
  Plus
} from "lucide-react";

function AmbulanceFleet() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAmbulances();
    // Set up real-time updates
    const interval = setInterval(fetchAmbulances, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await fetch("/api/ambulances");
      const data = await res.json();
      if (res.ok) {
        setAmbulances(data.ambulances);
      } else {
        setMessage("Error fetching ambulances");
      }
    } catch (error) {
      setMessage("Error fetching ambulances");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Available": "bg-green-100 text-green-700 border-green-200",
      "Dispatched": "bg-blue-100 text-blue-700 border-blue-200",
      "En Route": "bg-purple-100 text-purple-700 border-purple-200",
      "On Scene": "bg-orange-100 text-orange-700 border-orange-200",
      "Transporting": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Out of Service": "bg-red-100 text-red-700 border-red-200",
      "Maintenance": "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Available": <CheckCircle className="w-4 h-4" />,
      "Dispatched": <Activity className="w-4 h-4" />,
      "En Route": <Navigation className="w-4 h-4" />,
      "On Scene": <MapPin className="w-4 h-4" />,
      "Transporting": <Truck className="w-4 h-4" />,
      "Out of Service": <AlertTriangle className="w-4 h-4" />,
      "Maintenance": <Wrench className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const filteredAmbulances = ambulances.filter(ambulance => {
    if (filter === "available") return ambulance.status === "Available";
    if (filter === "active") return ["Dispatched", "En Route", "On Scene", "Transporting"].includes(ambulance.status);
    if (filter === "maintenance") return ["Out of Service", "Maintenance"].includes(ambulance.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading ambulance fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Ambulance Fleet</h1>
                  <p className="text-gray-600 text-xl">Monitor and manage emergency response vehicles</p>
                </div>
              </div>
              <button className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105">
                <Plus className="w-6 h-6" />
                Add Ambulance
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{ambulances.filter(a => a.status === "Available").length}</div>
                <div className="text-sm text-green-600">Available</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{ambulances.filter(a => ["Dispatched", "En Route", "On Scene", "Transporting"].includes(a.status)).length}</div>
                <div className="text-sm text-blue-600">Active</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{ambulances.filter(a => ["Out of Service", "Maintenance"].includes(a.status)).length}</div>
                <div className="text-sm text-red-600">Out of Service</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{ambulances.length}</div>
                <div className="text-sm text-purple-600">Total Fleet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Ambulances", count: ambulances.length },
              { key: "available", label: "Available", count: ambulances.filter(a => a.status === "Available").length },
              { key: "active", label: "Active Response", count: ambulances.filter(a => ["Dispatched", "En Route", "On Scene", "Transporting"].includes(a.status)).length },
              { key: "maintenance", label: "Maintenance", count: ambulances.filter(a => ["Out of Service", "Maintenance"].includes(a.status)).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-lg">
            <p className="text-red-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Ambulance Grid */}
        {filteredAmbulances.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Truck className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Ambulances Found</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No ambulances in the fleet." : `No ${filter} ambulances found.`}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAmbulances.map((ambulance) => (
              <div key={ambulance._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Ambulance Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{ambulance.callSign}</h3>
                        <p className="text-gray-600">{ambulance.vehicleNumber}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ambulance.status)}`}>
                      {getStatusIcon(ambulance.status)}
                      {ambulance.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Type:</strong> {ambulance.type}</p>
                    <p><strong>Base:</strong> {ambulance.baseStation}</p>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Vehicle Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Make/Model</p>
                      <p className="font-medium">{ambulance.make} {ambulance.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Year</p>
                      <p className="font-medium">{ambulance.year || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">License Plate</p>
                      <p className="font-medium">{ambulance.licensePlate || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Mileage</p>
                      <p className="font-medium">{ambulance.mileage ? `${ambulance.mileage.toLocaleString()} km` : "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Crew Information */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Crew
                  </h4>
                  {ambulance.crew?.length > 0 ? (
                    <div className="space-y-2">
                      {ambulance.crew.map((member, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{member.memberId?.name || "Unassigned"}</span>
                          <span className="text-gray-500">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-2">No crew assigned</p>
                      <p className="text-xs text-gray-400">Contact fleet management</p>
                    </div>
                  )}
                </div>

                {/* Status Information */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{ambulance.fuelLevel || 0}%</div>
                      <div className="text-xs text-blue-600">Fuel Level</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <Radio className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">{ambulance.radioChannel || "N/A"}</div>
                      <div className="text-xs text-green-600">Radio Ch.</div>
                    </div>
                  </div>
                </div>

                {/* Current Assignment */}
                {ambulance.currentEmergency && (
                  <div className="p-6 border-b border-gray-100 bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Current Assignment
                    </h4>
                    <p className="text-red-700 text-sm">
                      Emergency: {ambulance.currentEmergency.incidentNumber}
                    </p>
                    <p className="text-red-600 text-sm">
                      Priority: {ambulance.currentEmergency.priority}
                    </p>
                  </div>
                )}

                {/* Location */}
                {ambulance.currentLocation?.address && (
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Current Location
                    </h4>
                    <p className="text-gray-600 text-sm">{ambulance.currentLocation.address}</p>
                    <p className="text-gray-500 text-xs">
                      Last updated: {ambulance.currentLocation.lastUpdated ? 
                        new Date(ambulance.currentLocation.lastUpdated).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                )}

                {/* Maintenance */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </h4>
                    <button className="text-blue-600 hover:text-blue-700 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Service:</span>
                      <span className="font-medium">
                        {ambulance.lastMaintenance ? 
                          new Date(ambulance.lastMaintenance).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Service:</span>
                      <span className="font-medium">
                        {ambulance.nextMaintenance ? 
                          new Date(ambulance.nextMaintenance).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Track
                    </button>
                    <button className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
                    </button>
                    <button className="flex-1 bg-purple-50 text-purple-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AmbulanceFleet, ["admin", "dispatcher"]);