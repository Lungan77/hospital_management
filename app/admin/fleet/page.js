"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Truck, 
  Plus, 
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
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  X
} from "lucide-react";

function FleetManagement() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const getMaintenanceStatus = (ambulance) => {
    if (!ambulance.nextMaintenance) return "unknown";
    const daysUntil = Math.ceil((new Date(ambulance.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 7) return "due";
    if (daysUntil <= 30) return "upcoming";
    return "current";
  };

  const filteredAmbulances = ambulances.filter(ambulance => {
    const matchesSearch = ambulance.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambulance.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambulance.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "available") return ambulance.status === "Available" && matchesSearch;
    if (filter === "active") return ["Dispatched", "En Route", "On Scene", "Transporting"].includes(ambulance.status) && matchesSearch;
    if (filter === "maintenance") return ["Out of Service", "Maintenance"].includes(ambulance.status) && matchesSearch;
    if (filter === "due-maintenance") {
      const maintenanceStatus = getMaintenanceStatus(ambulance);
      return ["due", "overdue"].includes(maintenanceStatus) && matchesSearch;
    }
    return matchesSearch;
  });

  const updateAmbulanceStatus = async (ambulanceId, newStatus) => {
    try {
      const res = await fetch("/api/ambulances/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ambulanceId, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Ambulance status updated to ${newStatus}`);
        fetchAmbulances();
      } else {
        setMessage(data.error || "Failed to update status");
      }
    } catch (error) {
      setMessage("Error updating ambulance status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading fleet management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Fleet Management</h1>
                  <p className="text-gray-600 text-xl">Comprehensive ambulance fleet oversight and management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Add Ambulance
              </button>
            </div>
            
            {/* Fleet Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{ambulances.filter(a => getMaintenanceStatus(a) === "due" || getMaintenanceStatus(a) === "overdue").length}</div>
                <div className="text-sm text-yellow-600">Maintenance Due</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{ambulances.length}</div>
                <div className="text-sm text-purple-600">Total Fleet</div>
              </div>
              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
                <div className="text-2xl font-bold text-cyan-600">{Math.round((ambulances.filter(a => a.status === "Available").length / ambulances.length) * 100) || 0}%</div>
                <div className="text-sm text-cyan-600">Availability</div>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Assignment Section */}
        <CrewAssignmentSection 
          ambulances={ambulances}
          onCrewAssigned={fetchAmbulances}
        />

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by call sign, vehicle number, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All", count: ambulances.length },
                { key: "available", label: "Available", count: ambulances.filter(a => a.status === "Available").length },
                { key: "active", label: "Active", count: ambulances.filter(a => ["Dispatched", "En Route", "On Scene", "Transporting"].includes(a.status)).length },
                { key: "maintenance", label: "Maintenance", count: ambulances.filter(a => ["Out of Service", "Maintenance"].includes(a.status)).length },
                { key: "due-maintenance", label: "Due Service", count: ambulances.filter(a => ["due", "overdue"].includes(getMaintenanceStatus(a))).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
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
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Ambulance Grid */}
        {filteredAmbulances.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Truck className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Ambulances Found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {filter === "all" ? "No ambulances in the fleet." : `No ${filter} ambulances found.`}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Add First Ambulance
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAmbulances.map((ambulance) => {
              const maintenanceStatus = getMaintenanceStatus(ambulance);
              return (
                <div key={ambulance._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  {/* Ambulance Header */}
                  <div className="p-6 border-b border-gray-100 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          <Truck className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{ambulance.callSign}</h3>
                          <p className="text-gray-600">{ambulance.vehicleNumber}</p>
                          <p className="text-sm text-gray-500">{ambulance.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ambulance.status)}`}>
                          {getStatusIcon(ambulance.status)}
                          {ambulance.status}
                        </span>
                        {maintenanceStatus === "overdue" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        {maintenanceStatus === "due" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <Clock className="w-3 h-3" />
                            Due Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Make/Model</p>
                        <p className="font-semibold text-gray-900">{ambulance.make} {ambulance.model}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Year</p>
                        <p className="font-semibold text-gray-900">{ambulance.year || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Base Station</p>
                        <p className="font-semibold text-gray-900">{ambulance.baseStation}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Mileage</p>
                        <p className="font-semibold text-gray-900">{ambulance.mileage ? `${ambulance.mileage.toLocaleString()} km` : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-blue-600">{ambulance.fuelLevel || 0}%</div>
                        <div className="text-xs text-blue-600">Fuel</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <Radio className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-sm font-bold text-green-600">{ambulance.radioChannel || "N/A"}</div>
                        <div className="text-xs text-green-600">Radio</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-purple-600">{ambulance.crew?.length || 0}</div>
                        <div className="text-xs text-purple-600">Crew</div>
                      </div>
                    </div>
                  </div>

                  {/* Crew Information */}
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Crew Assignment
                    </h4>
                    {ambulance.crew?.length > 0 ? (
                      <div className="space-y-2">
                        {ambulance.crew.map((member, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
                            <span className="font-medium">{member.memberId?.name || "Unknown"}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              member.role === "Paramedic" ? "bg-red-100 text-red-700" :
                              member.role === "EMT" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No crew assigned</p>
                    )}
                  </div>

                  {/* Current Assignment */}
                  {ambulance.currentEmergency && (
                    <div className="p-6 border-b border-gray-100 bg-red-50">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Current Assignment
                      </h4>
                      <div className="text-sm space-y-1">
                        <p className="text-red-700">
                          <strong>Emergency:</strong> {ambulance.currentEmergency.incidentNumber}
                        </p>
                        <p className="text-red-600">
                          <strong>Priority:</strong> {ambulance.currentEmergency.priority}
                        </p>
                        <p className="text-red-600 text-xs">
                          Dispatched: {ambulance.currentEmergency.dispatchedAt ? 
                            new Date(ambulance.currentEmergency.dispatchedAt).toLocaleString() : "Unknown"}
                        </p>
                      </div>
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

                  {/* Maintenance Status */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Maintenance
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        maintenanceStatus === "overdue" ? "bg-red-100 text-red-700" :
                        maintenanceStatus === "due" ? "bg-yellow-100 text-yellow-700" :
                        maintenanceStatus === "upcoming" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {maintenanceStatus === "overdue" ? "Overdue" :
                         maintenanceStatus === "due" ? "Due Soon" :
                         maintenanceStatus === "upcoming" ? "Upcoming" : "Current"}
                      </span>
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
                      {ambulance.nextMaintenance && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Days Until:</span>
                          <span className={`font-medium ${
                            Math.ceil((new Date(ambulance.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24)) < 0 ? "text-red-600" :
                            Math.ceil((new Date(ambulance.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 ? "text-yellow-600" :
                            "text-green-600"
                          }`}>
                            {Math.ceil((new Date(ambulance.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Equipment Status */}
                  {ambulance.equipment?.length > 0 && (
                    <div className="p-6 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Equipment Status
                      </h4>
                      <div className="space-y-2">
                        {ambulance.equipment.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.status === "Operational" ? "bg-green-100 text-green-700" :
                              item.status === "Needs Maintenance" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                        {ambulance.equipment.length > 3 && (
                          <p className="text-xs text-gray-500">+{ambulance.equipment.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button 
                        onClick={() => {
                          setSelectedAmbulance(ambulance);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
                        <MapPin className="w-4 h-4" />
                        Track
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button className="flex items-center justify-center gap-1 bg-purple-50 text-purple-600 py-2 px-2 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors">
                        <Phone className="w-3 h-3" />
                        Call
                      </button>
                      <button className="flex items-center justify-center gap-1 bg-orange-50 text-orange-600 py-2 px-2 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="flex items-center justify-center gap-1 bg-gray-50 text-gray-600 py-2 px-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                        <Settings className="w-3 h-3" />
                        Config
                      </button>
                    </div>

                    {/* Quick Status Updates */}
                    {ambulance.status === "Available" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateAmbulanceStatus(ambulance._id, "Maintenance")}
                            className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition-colors"
                          >
                            Maintenance
                          </button>
                          <button
                            onClick={() => updateAmbulanceStatus(ambulance._id, "Out of Service")}
                            className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Out of Service
                          </button>
                        </div>
                      </div>
                    )}

                    {["Maintenance", "Out of Service"].includes(ambulance.status) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => updateAmbulanceStatus(ambulance._id, "Available")}
                          className="w-full bg-green-50 text-green-600 py-2 px-3 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
                        >
                          Return to Service
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fleet Analytics */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((ambulances.filter(a => a.status === "Available").length / ambulances.length) * 100) || 0}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Fleet Availability</div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((ambulances.filter(a => a.status === "Available").length / ambulances.length) * 100) || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => a.fuelLevel >= 75).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Well Fueled (75%+)</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Wrench className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => ["due", "overdue"].includes(getMaintenanceStatus(a))).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Maintenance Due</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => a.crew?.length >= 2).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Fully Staffed</div>
          </div>
        </div>
      </div>

      {/* Ambulance Details Modal */}
      {showDetailsModal && selectedAmbulance && (
        <AmbulanceDetailsModal 
          ambulance={selectedAmbulance}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAmbulance(null);
          }}
          onUpdate={fetchAmbulances}
        />
      )}

      {/* Add Ambulance Modal */}
      {showAddModal && (
        <AddAmbulanceModal 
          onClose={() => setShowAddModal(false)}
          onAdd={fetchAmbulances}
        />
      )}
    </div>
  );
}

// Crew Assignment Section Component
function CrewAssignmentSection({ ambulances, onCrewAssigned }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Crew Assignment Overview
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {ambulances.filter(a => a.crew?.length >= 2).length}
          </div>
          <div className="text-sm text-green-600">Fully Staffed</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {ambulances.filter(a => a.crew?.length === 1).length}
          </div>
          <div className="text-sm text-yellow-600">Partially Staffed</div>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {ambulances.filter(a => !a.crew || a.crew.length === 0).length}
          </div>
          <div className="text-sm text-red-600">No Crew</div>
        </div>
      </div>
    </div>
  );
}

// Ambulance Details Modal Component
function AmbulanceDetailsModal({ ambulance, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "crew", label: "Crew", icon: <Users className="w-4 h-4" /> },
    { id: "equipment", label: "Equipment", icon: <Shield className="w-4 h-4" /> },
    { id: "maintenance", label: "Maintenance", icon: <Wrench className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <Clock className="w-4 h-4" /> }
  ];

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{ambulance.callSign}</h2>
              <p className="text-gray-600">{ambulance.vehicleNumber} - {ambulance.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Vehicle Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Make/Model:</span>
                      <span className="font-semibold">{ambulance.make} {ambulance.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-semibold">{ambulance.year || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">License Plate:</span>
                      <span className="font-semibold">{ambulance.licensePlate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-semibold">{ambulance.mileage ? `${ambulance.mileage.toLocaleString()} km` : "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Operational Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(ambulance.status)}`}>
                        {ambulance.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Level:</span>
                      <span className="font-semibold">{ambulance.fuelLevel || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Radio Channel:</span>
                      <span className="font-semibold">{ambulance.radioChannel || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Station:</span>
                      <span className="font-semibold">{ambulance.baseStation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "crew" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Crew Assignment</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Crew
                </button>
              </div>
              
              {ambulance.crew?.length > 0 ? (
                <div className="space-y-4">
                  {ambulance.crew.map((member, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.memberId?.name || "Unknown"}</h4>
                          <p className="text-gray-600">{member.role}</p>
                          {member.certificationLevel && (
                            <p className="text-sm text-gray-500">Certification: {member.certificationLevel}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                            Contact
                          </button>
                          <button className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-100 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No crew members assigned</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Equipment Inventory</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Equipment
                </button>
              </div>
              
              {ambulance.equipment?.length > 0 ? (
                <div className="space-y-3">
                  {ambulance.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        {item.lastChecked && (
                          <p className="text-sm text-gray-500">
                            Last checked: {new Date(item.lastChecked).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === "Operational" ? "bg-green-100 text-green-700" :
                        item.status === "Needs Maintenance" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No equipment registered</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Maintenance Schedule</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Last Service</h4>
                  <p className="text-blue-800">
                    {ambulance.lastMaintenance ? 
                      new Date(ambulance.lastMaintenance).toLocaleDateString() : "No record"}
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Next Service</h4>
                  <p className="text-yellow-800">
                    {ambulance.nextMaintenance ? 
                      new Date(ambulance.nextMaintenance).toLocaleDateString() : "Not scheduled"}
                  </p>
                </div>
              </div>
              
              {ambulance.maintenanceNotes && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Maintenance Notes</h4>
                  <p className="text-gray-700">{ambulance.maintenanceNotes}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Schedule Maintenance
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Record Service
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Ambulance Modal Component
function AddAmbulanceModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    callSign: "",
    vehicleNumber: "",
    type: "Basic Life Support",
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    baseStation: "",
    radioChannel: "",
    fuelLevel: 100
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/ambulances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Ambulance added successfully!");
        onAdd();
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage(data.error || "Failed to add ambulance");
      }
    } catch (error) {
      setMessage("Error adding ambulance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Ambulance</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes("successfully") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Call Sign *</label>
              <input
                type="text"
                required
                value={formData.callSign}
                onChange={(e) => setFormData(prev => ({ ...prev, callSign: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AMB-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number *</label>
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., VH-12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Basic Life Support">Basic Life Support</option>
                <option value="Advanced Life Support">Advanced Life Support</option>
                <option value="Critical Care">Critical Care</option>
                <option value="Rescue">Rescue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Base Station *</label>
              <input
                type="text"
                required
                value={formData.baseStation}
                onChange={(e) => setFormData(prev => ({ ...prev, baseStation: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Central Station"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mercedes-Benz"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sprinter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2023"
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC-123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Radio Channel</label>
              <input
                type="text"
                value={formData.radioChannel}
                onChange={(e) => setFormData(prev => ({ ...prev, radioChannel: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CH-7"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Fuel Level (%)</label>
              <input
                type="number"
                value={formData.fuelLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Ambulance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(FleetManagement, ["admin", "dispatcher"]);