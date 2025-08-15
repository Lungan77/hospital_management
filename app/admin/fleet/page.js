"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
  Plus,
  X,
  User,
  Shield
} from "lucide-react";

function FleetManagement() {
  const [ambulances, setAmbulances] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableParamedics, setAvailableParamedics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    driverId: "",
    paramedicId: ""
  });

  const [newAmbulance, setNewAmbulance] = useState({
    vehicleNumber: "",
    callSign: "",
    type: "Basic Life Support",
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    baseStation: "",
    radioChannel: "",
    fuelLevel: 100
  });

  useEffect(() => {
    fetchAmbulances();
    fetchAvailableCrew();
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

  const fetchAvailableCrew = async () => {
    try {
      const res = await fetch("/api/ambulances/crew/available");
      const data = await res.json();
      if (res.ok) {
        setAvailableDrivers(data.drivers || []);
        setAvailableParamedics(data.paramedics || []);
      }
    } catch (error) {
      console.error("Error fetching available crew");
    }
  };

  const addAmbulance = async () => {
    if (!newAmbulance.vehicleNumber || !newAmbulance.callSign) {
      setMessage("Vehicle number and call sign are required");
      return;
    }

    try {
      const res = await fetch("/api/ambulances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAmbulance),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Ambulance added successfully");
        fetchAmbulances();
        setShowAddModal(false);
        setNewAmbulance({
          vehicleNumber: "",
          callSign: "",
          type: "Basic Life Support",
          make: "",
          model: "",
          year: "",
          licensePlate: "",
          baseStation: "",
          radioChannel: "",
          fuelLevel: 100
        });
      } else {
        setMessage(data.error || "Error adding ambulance");
      }
    } catch (error) {
      setMessage("Error adding ambulance");
    }
  };

  const assignCrew = async () => {
    if (!assignmentData.driverId && !assignmentData.paramedicId) {
      setMessage("Please select at least one crew member");
      return;
    }

    try {
      const res = await fetch("/api/ambulances/crew/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: selectedAmbulance._id,
          driverId: assignmentData.driverId || null,
          paramedicId: assignmentData.paramedicId || null
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Crew assigned successfully");
        fetchAmbulances();
        fetchAvailableCrew();
        setShowAssignModal(false);
        setSelectedAmbulance(null);
        setAssignmentData({ driverId: "", paramedicId: "" });
      } else {
        setMessage(data.error || "Error assigning crew");
      }
    } catch (error) {
      setMessage("Error assigning crew");
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
          <p className="text-gray-600 text-lg">Loading fleet management...</p>
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
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Fleet Management</h1>
                  <p className="text-gray-600 text-xl">Manage ambulance fleet and crew assignments</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link href="/fleet/tracking">
                  <button className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105">
                    <MapPin className="w-6 h-6" />
                    Live Tracking
                  </button>
                </Link>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Add Ambulance
                </button>
              </div>
            </div>
            
            {/* Fleet Overview Stats */}
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
                    Crew Assignment
                  </h4>
                  {ambulance.crew?.length > 0 ? (
                    <div className="space-y-2">
                      {ambulance.crew.map((member, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{member.memberId?.name || "Unassigned"}</span>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {member.certificationLevel || "Certified"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm mb-2">No crew assigned</p>
                      <p className="text-xs text-gray-400">Click &quot;Assign Crew&quot; to add personnel</p>
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

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => {
                        setSelectedAmbulance(ambulance);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-purple-50 text-purple-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Assign Crew
                    </button>
                    <Link href="/fleet/tracking" className="flex-1">
                      <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Track
                      </button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-green-50 text-green-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
                    </button>
                    <button className="bg-yellow-50 text-yellow-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-yellow-100 transition-colors flex items-center justify-center gap-2">
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

      {/* Add Ambulance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Ambulance</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number *</label>
                  <input
                    type="text"
                    value={newAmbulance.vehicleNumber}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AMB-001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Call Sign *</label>
                  <input
                    type="text"
                    value={newAmbulance.callSign}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, callSign: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., RESCUE-1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={newAmbulance.type}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Basic Life Support">Basic Life Support</option>
                    <option value="Advanced Life Support">Advanced Life Support</option>
                    <option value="Critical Care">Critical Care</option>
                    <option value="Rescue">Rescue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Station</label>
                  <input
                    type="text"
                    value={newAmbulance.baseStation}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, baseStation: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Station 1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
                  <input
                    type="text"
                    value={newAmbulance.make}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, make: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Ford"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={newAmbulance.model}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Transit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={newAmbulance.year}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                    min="1990"
                    max="2030"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                  <input
                    type="text"
                    value={newAmbulance.licensePlate}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, licensePlate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ABC-123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Radio Channel</label>
                  <input
                    type="text"
                    value={newAmbulance.radioChannel}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, radioChannel: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CH-7"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Level (%)</label>
                  <input
                    type="number"
                    value={newAmbulance.fuelLevel}
                    onChange={(e) => setNewAmbulance(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addAmbulance}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  Add Ambulance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Crew Modal */}
      {showAssignModal && selectedAmbulance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Assign Crew - {selectedAmbulance.callSign}
              </h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAmbulance(null);
                  setAssignmentData({ driverId: "", paramedicId: "" });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Crew Display */}
              {selectedAmbulance.crew?.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">Current Crew</h3>
                  <div className="space-y-2">
                    {selectedAmbulance.crew.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{member.memberId?.name || "Unknown"}</span>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Driver</label>
                  <select
                    value={assignmentData.driverId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Driver</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {availableDrivers.length} available drivers
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Paramedic</label>
                  <select
                    value={assignmentData.paramedicId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, paramedicId: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Paramedic</option>
                    {availableParamedics.map((paramedic) => (
                      <option key={paramedic._id} value={paramedic._id}>
                        {paramedic.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {availableParamedics.length} available paramedics
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You can assign a driver only, paramedic only, or both. 
                  Assigning new crew will replace any existing assignments for this ambulance.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAmbulance(null);
                    setAssignmentData({ driverId: "", paramedicId: "" });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={assignCrew}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Assign Crew
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(FleetManagement, ["admin", "dispatcher"]);