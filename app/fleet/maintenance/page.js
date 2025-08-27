"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Truck,
  DollarSign,
  User,
  FileText,
  Plus,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  X,
  Save,
  Edit,
  History,
  Settings,
  RefreshCw
} from "lucide-react";

function MaintenanceManagement() {
  const [ambulances, setAmbulances] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: "Routine Service",
    description: "",
    scheduledDate: "",
    estimatedCost: "",
    performedBy: "",
    nextMaintenanceDate: "",
    mileage: "",
    priority: "Medium",
    estimatedDuration: "",
    notes: ""
  });

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    try {
      const [ambulancesRes, maintenanceRes] = await Promise.all([
        fetch("/api/ambulances"),
        fetch("/api/ambulances/maintenance")
      ]);
      
      const ambulancesData = await ambulancesRes.json();
      const maintenanceData = await maintenanceRes.json();
      
      if (ambulancesRes.ok) setAmbulances(ambulancesData.ambulances);
      if (maintenanceRes.ok) setMaintenanceRecords(maintenanceData.records || []);
    } catch (error) {
      setMessage("Error fetching maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceStatus = (ambulance) => {
    if (!ambulance.nextMaintenance) return { status: "unknown", days: null, color: "gray" };
    
    const daysUntil = Math.ceil((new Date(ambulance.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { status: "overdue", days: Math.abs(daysUntil), color: "red" };
    if (daysUntil <= 7) return { status: "due", days: daysUntil, color: "yellow" };
    if (daysUntil <= 30) return { status: "upcoming", days: daysUntil, color: "blue" };
    return { status: "current", days: daysUntil, color: "green" };
  };

  const openScheduleModal = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setMaintenanceForm({
      maintenanceType: "Routine Service",
      description: "",
      scheduledDate: "",
      estimatedCost: "",
      performedBy: "",
      nextMaintenanceDate: "",
      mileage: ambulance.mileage?.toString() || "",
      priority: "Medium",
      estimatedDuration: "",
      notes: ""
    });
    setShowScheduleModal(true);
  };

  const scheduleMaintenanceForAmbulance = async () => {
    if (!selectedAmbulance || !maintenanceForm.scheduledDate) {
      setMessage("Please select a date for maintenance");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ambulances/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: selectedAmbulance._id,
          ...maintenanceForm
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Maintenance scheduled successfully");
        fetchMaintenanceData();
        setShowScheduleModal(false);
        setSelectedAmbulance(null);
      } else {
        setMessage(data.error || "Error scheduling maintenance");
      }
    } catch (error) {
      setMessage("Error scheduling maintenance");
    } finally {
      setSaving(false);
    }
  };

  const markMaintenanceComplete = async (ambulanceId) => {
    try {
      const res = await fetch("/api/ambulances/maintenance/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ambulanceId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Maintenance marked as complete");
        fetchMaintenanceData();
      } else {
        setMessage(data.error || "Error completing maintenance");
      }
    } catch (error) {
      setMessage("Error completing maintenance");
    }
  };

  const updateMaintenanceStatus = async (ambulanceId, status) => {
    try {
      const res = await fetch("/api/ambulances/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ambulanceId, status }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Ambulance status updated to ${status}`);
        fetchMaintenanceData();
      } else {
        setMessage(data.error || "Error updating status");
      }
    } catch (error) {
      setMessage("Error updating ambulance status");
    }
  };

  const filteredAmbulances = ambulances.filter(ambulance => {
    const matchesSearch = ambulance.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ambulance.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const maintenanceStatus = getMaintenanceStatus(ambulance);
    
    if (filter === "overdue") return maintenanceStatus.status === "overdue" && matchesSearch;
    if (filter === "due") return maintenanceStatus.status === "due" && matchesSearch;
    if (filter === "upcoming") return maintenanceStatus.status === "upcoming" && matchesSearch;
    if (filter === "current") return maintenanceStatus.status === "current" && matchesSearch;
    if (filter === "maintenance") return ambulance.status === "Maintenance" && matchesSearch;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Fleet Maintenance</h1>
                  <p className="text-gray-600 text-xl">Comprehensive ambulance maintenance management system</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    fetchMaintenanceData();
                    setMessage("Maintenance data refreshed");
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-yellow-500/25 transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Schedule Maintenance
                </button>
              </div>
            </div>
            
            {/* Maintenance Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {ambulances.filter(a => getMaintenanceStatus(a).status === "overdue").length}
                </div>
                <div className="text-sm text-red-600">Overdue</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {ambulances.filter(a => getMaintenanceStatus(a).status === "due").length}
                </div>
                <div className="text-sm text-yellow-600">Due Soon</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {ambulances.filter(a => getMaintenanceStatus(a).status === "upcoming").length}
                </div>
                <div className="text-sm text-blue-600">Upcoming</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {ambulances.filter(a => getMaintenanceStatus(a).status === "current").length}
                </div>
                <div className="text-sm text-green-600">Current</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((ambulances.filter(a => getMaintenanceStatus(a).status === "current").length / Math.max(ambulances.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-purple-600">Compliance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by call sign or vehicle number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All", count: ambulances.length },
                { key: "overdue", label: "Overdue", count: ambulances.filter(a => getMaintenanceStatus(a).status === "overdue").length },
                { key: "due", label: "Due Soon", count: ambulances.filter(a => getMaintenanceStatus(a).status === "due").length },
                { key: "upcoming", label: "Upcoming", count: ambulances.filter(a => getMaintenanceStatus(a).status === "upcoming").length },
                { key: "current", label: "Current", count: ambulances.filter(a => getMaintenanceStatus(a).status === "current").length },
                { key: "maintenance", label: "In Maintenance", count: ambulances.filter(a => a.status === "Maintenance").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    filter === tab.key
                      ? "bg-yellow-600 text-white shadow-lg"
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
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") || message.includes("complete") || message.includes("refreshed")
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("complete") || message.includes("refreshed") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") || message.includes("complete") || message.includes("refreshed") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Maintenance Schedule Grid */}
        {filteredAmbulances.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Wrench className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Maintenance Records</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No ambulances found." : `No ${filter} maintenance items found.`}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAmbulances.map((ambulance) => {
              const maintenanceStatus = getMaintenanceStatus(ambulance);
              return (
                <div key={ambulance._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  {/* Ambulance Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          <Truck className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{ambulance.callSign}</h3>
                          <p className="text-gray-600">{ambulance.vehicleNumber}</p>
                          <p className="text-sm text-gray-500">{ambulance.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                          maintenanceStatus.status === "overdue" ? "bg-red-100 text-red-700 border-red-200" :
                          maintenanceStatus.status === "due" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          maintenanceStatus.status === "upcoming" ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-green-100 text-green-700 border-green-200"
                        }`}>
                          {maintenanceStatus.status === "overdue" && <AlertTriangle className="w-4 h-4" />}
                          {maintenanceStatus.status === "due" && <Clock className="w-4 h-4" />}
                          {maintenanceStatus.status === "upcoming" && <Calendar className="w-4 h-4" />}
                          {maintenanceStatus.status === "current" && <CheckCircle className="w-4 h-4" />}
                          {maintenanceStatus.status === "overdue" ? "Overdue" :
                           maintenanceStatus.status === "due" ? "Due Soon" :
                           maintenanceStatus.status === "upcoming" ? "Upcoming" : "Current"}
                        </span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                          ambulance.status === "Available" ? "bg-green-100 text-green-700 border-green-200" :
                          ambulance.status === "Maintenance" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          ambulance.status === "Out of Service" ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {ambulance.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Details */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Last Service</p>
                          <p className="font-semibold text-gray-900">
                            {ambulance.lastMaintenance ? 
                              new Date(ambulance.lastMaintenance).toLocaleDateString() : "No record"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Next Service</p>
                          <p className={`font-semibold ${
                            maintenanceStatus.status === "overdue" ? "text-red-600" :
                            maintenanceStatus.status === "due" ? "text-yellow-600" :
                            "text-gray-900"
                          }`}>
                            {ambulance.nextMaintenance ? 
                              new Date(ambulance.nextMaintenance).toLocaleDateString() : "Not scheduled"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Mileage</p>
                          <p className="font-semibold text-gray-900">
                            {ambulance.mileage ? `${ambulance.mileage.toLocaleString()} km` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Days Until</p>
                          <p className={`font-semibold ${
                            maintenanceStatus.status === "overdue" ? "text-red-600" :
                            maintenanceStatus.status === "due" ? "text-yellow-600" :
                            maintenanceStatus.status === "upcoming" ? "text-blue-600" :
                            "text-green-600"
                          }`}>
                            {maintenanceStatus.days !== null ? 
                              (maintenanceStatus.status === "overdue" ? 
                                `${maintenanceStatus.days} days overdue` : 
                                `${maintenanceStatus.days} days`) : 
                              "Unknown"}
                          </p>
                        </div>
                      </div>

                      {ambulance.maintenanceNotes && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 font-medium text-sm mb-1">Last Service Notes</p>
                          <p className="text-gray-700 text-sm">{ambulance.maintenanceNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button 
                        onClick={() => openScheduleModal(ambulance)}
                        className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-yellow-100 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAmbulance(ambulance);
                          setShowHistoryModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <History className="w-4 h-4" />
                        History
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {ambulance.status !== "Maintenance" ? (
                        <button
                          onClick={() => updateMaintenanceStatus(ambulance._id, "Maintenance")}
                          className="bg-orange-50 text-orange-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Wrench className="w-4 h-4" />
                          Start Maintenance
                        </button>
                      ) : (
                        <button
                          onClick={() => markMaintenanceComplete(ambulance._id)}
                          className="bg-green-50 text-green-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      
                      <button
                        onClick={() => updateMaintenanceStatus(ambulance._id, ambulance.status === "Available" ? "Out of Service" : "Available")}
                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          ambulance.status === "Available" 
                            ? "bg-red-50 text-red-600 hover:bg-red-100" 
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        {ambulance.status === "Available" ? "Out of Service" : "Return to Service"}
                      </button>
                    </div>
                    
                    {maintenanceStatus.status === "overdue" && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Maintenance overdue - schedule immediately
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Maintenance Analytics */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => getMaintenanceStatus(a).status === "overdue").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Overdue Maintenance</div>
            <div className="text-sm text-red-600 font-semibold">Requires immediate attention</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => ["due", "upcoming"].includes(getMaintenanceStatus(a).status)).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Scheduled Soon</div>
            <div className="text-sm text-yellow-600 font-semibold">Next 30 days</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((ambulances.filter(a => getMaintenanceStatus(a).status === "current").length / Math.max(ambulances.length, 1)) * 100)}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Compliance Rate</div>
            <div className="text-sm text-green-600 font-semibold">Fleet maintenance</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ambulances.filter(a => a.lastMaintenance && 
                    new Date(a.lastMaintenance) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Serviced This Month</div>
            <div className="text-sm text-blue-600 font-semibold">Recent activity</div>
          </div>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Schedule Maintenance {selectedAmbulance ? `- ${selectedAmbulance.callSign}` : ""}
              </h2>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedAmbulance(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!selectedAmbulance && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ambulance</label>
                  <select
                    value={selectedAmbulance?._id || ""}
                    onChange={(e) => {
                      const ambulance = ambulances.find(a => a._id === e.target.value);
                      setSelectedAmbulance(ambulance);
                      if (ambulance) {
                        setMaintenanceForm(prev => ({ ...prev, mileage: ambulance.mileage?.toString() || "" }));
                      }
                    }}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Choose an ambulance</option>
                    {ambulances.map((ambulance) => (
                      <option key={ambulance._id} value={ambulance._id}>
                        {ambulance.callSign} - {ambulance.vehicleNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance Type *</label>
                  <select
                    value={maintenanceForm.maintenanceType}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, maintenanceType: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Routine Service">Routine Service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Electrical Repair">Electrical Repair</option>
                    <option value="Medical Equipment Check">Medical Equipment Check</option>
                    <option value="Annual Inspection">Annual Inspection</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                    <option value="Body Work">Body Work</option>
                    <option value="Transmission Service">Transmission Service</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                  <select
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical - Immediate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    value={maintenanceForm.scheduledDate}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Duration</label>
                  <select
                    value={maintenanceForm.estimatedDuration}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select Duration</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="8 hours">8 hours (Full Day)</option>
                    <option value="1 day">1 day</option>
                    <option value="2 days">2 days</option>
                    <option value="1 week">1 week</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Cost</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={maintenanceForm.estimatedCost}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                      className="w-full pl-10 pr-4 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Performed By</label>
                  <input
                    type="text"
                    value={maintenanceForm.performedBy}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, performedBy: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Technician name or company"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Mileage</label>
                  <input
                    type="number"
                    value={maintenanceForm.mileage}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, mileage: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Current odometer reading"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Next Maintenance Date</label>
                  <input
                    type="date"
                    value={maintenanceForm.nextMaintenanceDate}
                    onChange={(e) => setMaintenanceForm(prev => ({ ...prev, nextMaintenanceDate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance Description</label>
                <textarea
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows="4"
                  placeholder="Describe the maintenance work to be performed..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={maintenanceForm.notes}
                  onChange={(e) => setMaintenanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows="3"
                  placeholder="Any additional notes or special instructions..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedAmbulance(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleMaintenanceForAmbulance}
                  disabled={saving || !selectedAmbulance}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? "Scheduling..." : "Schedule Maintenance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance History Modal */}
      {showHistoryModal && selectedAmbulance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Maintenance History - {selectedAmbulance.callSign}
              </h2>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedAmbulance(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Current Status */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Status</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 font-medium">Last Service</p>
                      <p className="text-blue-800">
                        {selectedAmbulance.lastMaintenance ? 
                          new Date(selectedAmbulance.lastMaintenance).toLocaleDateString() : "No record"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Next Service</p>
                      <p className="text-blue-800">
                        {selectedAmbulance.nextMaintenance ? 
                          new Date(selectedAmbulance.nextMaintenance).toLocaleDateString() : "Not scheduled"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Current Mileage</p>
                      <p className="text-blue-800">
                        {selectedAmbulance.mileage ? `${selectedAmbulance.mileage.toLocaleString()} km` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maintenance Records Placeholder */}
                <div className="text-center py-12">
                  <History className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Maintenance History</h3>
                  <p className="text-gray-600">Detailed maintenance records will be displayed here</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Integration with maintenance tracking system coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(MaintenanceManagement, ["admin", "dispatcher"]);