"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Bed, 
  Users, 
  MapPin, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Wrench,
  Sparkles,
  User,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  X,
  Save,
  RefreshCw,
  Building,
  Shield,
  Star,
  TrendingUp,
  BarChart3
} from "lucide-react";

function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [transferData, setTransferData] = useState({
    fromBedId: "",
    toBedId: "",
    reason: "",
    notes: ""
  });
  const [newBed, setNewBed] = useState({
    bedNumber: "",
    wardId: "",
    bedType: "Standard",
    floor: 1,
    room: "",
    position: "",
    features: []
  });

  useEffect(() => {
    fetchBedData();
    fetchWards();
    fetchPatients();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchBedData();
      fetchPatients();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBedData = async () => {
    try {
      const res = await fetch("/api/beds");
      const data = await res.json();
      if (res.ok) {
        setBeds(data.beds || []);
      } else {
        setMessage("Error loading bed data");
      }
    } catch (error) {
      setMessage("Error fetching bed information");
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const res = await fetch("/api/wards");
      const data = await res.json();
      if (res.ok) {
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error("Error fetching wards");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/er/admission");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.admissions || []);
      }
    } catch (error) {
      console.error("Error fetching patients");
    }
  };

  const assignBed = async () => {
    if (!selectedBed || !selectedPatient) {
      setMessage("Please select both a bed and a patient");
      return;
    }

    try {
      const res = await fetch("/api/beds/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedId: selectedBed._id,
          patientId: selectedPatient
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchBedData();
        fetchPatients();
        setShowAssignModal(false);
        setSelectedBed(null);
        setSelectedPatient("");
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error assigning bed");
    }
  };

  const transferPatient = async () => {
    if (!transferData.fromBedId || !transferData.toBedId || !transferData.reason) {
      setMessage("Please fill in all transfer details");
      return;
    }

    try {
      const res = await fetch("/api/beds/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchBedData();
        setShowTransferModal(false);
        setTransferData({ fromBedId: "", toBedId: "", reason: "", notes: "" });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error transferring patient");
    }
  };

  const dischargeBed = async (bedId) => {
    if (!confirm("Are you sure you want to discharge this patient and release the bed?")) return;

    try {
      const res = await fetch("/api/beds/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchBedData();
        fetchPatients();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error discharging patient");
    }
  };

  const updateBedStatus = async (bedId, status) => {
    try {
      const res = await fetch("/api/beds/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId, status }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchBedData();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating bed status");
    }
  };

  const addBed = async () => {
    if (!newBed.bedNumber || !newBed.wardId || !newBed.room) {
      setMessage("Please fill in all required bed information");
      return;
    }

    try {
      const res = await fetch("/api/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBed),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchBedData();
        setShowAddBedModal(false);
        setNewBed({
          bedNumber: "",
          wardId: "",
          bedType: "Standard",
          floor: 1,
          room: "",
          position: "",
          features: []
        });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error adding bed");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Available": "bg-green-100 text-green-700 border-green-200",
      "Occupied": "bg-blue-100 text-blue-700 border-blue-200",
      "Reserved": "bg-purple-100 text-purple-700 border-purple-200",
      "Cleaning": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Maintenance": "bg-orange-100 text-orange-700 border-orange-200",
      "Out of Service": "bg-red-100 text-red-700 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Available": <CheckCircle className="w-4 h-4" />,
      "Occupied": <User className="w-4 h-4" />,
      "Reserved": <Clock className="w-4 h-4" />,
      "Cleaning": <Sparkles className="w-4 h-4" />,
      "Maintenance": <Wrench className="w-4 h-4" />,
      "Out of Service": <AlertTriangle className="w-4 h-4" />
    };
    return icons[status] || <Activity className="w-4 h-4" />;
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.wardId?.wardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bed.currentPatient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter === "all" || bed.status === filter;
    const matchesWard = wardFilter === "" || bed.wardId?._id === wardFilter;
    
    return matchesSearch && matchesStatus && matchesWard;
  });

  const getWardStats = () => {
    const stats = {};
    wards.forEach(ward => {
      const wardBeds = beds.filter(bed => bed.wardId?._id === ward._id);
      stats[ward._id] = {
        total: wardBeds.length,
        available: wardBeds.filter(bed => bed.status === "Available").length,
        occupied: wardBeds.filter(bed => bed.status === "Occupied").length,
        cleaning: wardBeds.filter(bed => bed.status === "Cleaning").length,
        maintenance: wardBeds.filter(bed => ["Maintenance", "Out of Service"].includes(bed.status)).length
      };
    });
    return stats;
  };

  const wardStats = getWardStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading bed management...</p>
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
                  <Bed className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Bed Management</h1>
                  <p className="text-gray-600 text-xl">Hospital bed allocation and ward management system</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    fetchBedData();
                    fetchPatients();
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddBedModal(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Add Bed
                </button>
              </div>
            </div>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{beds.filter(b => b.status === "Available").length}</div>
                <div className="text-sm text-green-600">Available Beds</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{beds.filter(b => b.status === "Occupied").length}</div>
                <div className="text-sm text-blue-600">Occupied Beds</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{beds.filter(b => b.status === "Cleaning").length}</div>
                <div className="text-sm text-yellow-600">Being Cleaned</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {beds.length > 0 ? Math.round((beds.filter(b => b.status === "Occupied").length / beds.length) * 100) : 0}%
                </div>
                <div className="text-sm text-purple-600">Occupancy Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ward Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            Ward Overview
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wards.map((ward) => {
              const stats = wardStats[ward._id] || { total: 0, available: 0, occupied: 0, cleaning: 0, maintenance: 0 };
              const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
              
              return (
                <div key={ward._id} className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{ward.wardName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      ward.wardStatus === "Operational" ? "bg-green-100 text-green-700" :
                      ward.wardStatus === "Limited Capacity" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {ward.wardStatus}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Beds:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Available:</span>
                      <span className="font-semibold text-green-700">{stats.available}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Occupied:</span>
                      <span className="font-semibold text-blue-700">{stats.occupied}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">Occupancy:</span>
                      <span className="font-semibold text-purple-700">{occupancyRate}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
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
                  placeholder="Search by bed number, ward, or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Wards</option>
                {wards.map((ward) => (
                  <option key={ward._id} value={ward._id}>{ward.wardName}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All", count: beds.length },
                  { key: "Available", label: "Available", count: beds.filter(b => b.status === "Available").length },
                  { key: "Occupied", label: "Occupied", count: beds.filter(b => b.status === "Occupied").length },
                  { key: "Cleaning", label: "Cleaning", count: beds.filter(b => b.status === "Cleaning").length },
                  { key: "Maintenance", label: "Maintenance", count: beds.filter(b => ["Maintenance", "Out of Service"].includes(b.status)).length }
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
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") || message.includes("assigned") || message.includes("transferred")
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("assigned") || message.includes("transferred") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") || message.includes("assigned") || message.includes("transferred") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <User className="w-5 h-5" />
              Assign Patient to Bed
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Activity className="w-5 h-5" />
              Transfer Patient
            </button>
            <button
              onClick={() => updateBedStatus("", "Cleaning")}
              className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Mark for Cleaning
            </button>
          </div>
        </div>

        {/* Bed Grid */}
        {filteredBeds.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Bed className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Beds Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || filter !== "all" || wardFilter ? "No beds match your current filters." : "No beds have been configured yet."}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBeds.map((bed) => (
              <div key={bed._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Bed Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Bed className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{bed.bedNumber}</h3>
                        <p className="text-gray-600">{bed.wardId?.wardName || "Unknown Ward"}</p>
                        <p className="text-sm text-gray-500">{bed.bedType}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(bed.status)}`}>
                      {getStatusIcon(bed.status)}
                      {bed.status}
                    </span>
                  </div>
                </div>

                {/* Bed Details */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Location</p>
                      <p className="font-semibold text-gray-900">
                        Floor {bed.location?.floor}, Room {bed.location?.room}
                        {bed.location?.position && ` (${bed.location.position})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Type</p>
                      <p className="font-semibold text-gray-900">{bed.bedType}</p>
                    </div>
                  </div>
                </div>

                {/* Current Patient */}
                {bed.currentPatient ? (
                  <div className="p-6 border-b border-gray-100 bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Current Patient
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700">
                        <strong>Name:</strong> {bed.currentPatient.firstName} {bed.currentPatient.lastName}
                      </p>
                      <p className="text-blue-700">
                        <strong>ID:</strong> {bed.currentPatient.patientId}
                      </p>
                      <p className="text-blue-700">
                        <strong>Admitted:</strong> {bed.assignedAt ? new Date(bed.assignedAt).toLocaleString() : "Unknown"}
                      </p>
                      <p className="text-blue-700">
                        <strong>Condition:</strong> {bed.currentPatient.chiefComplaint}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-b border-gray-100">
                    <div className="text-center py-4">
                      <Bed className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No patient assigned</p>
                    </div>
                  </div>
                )}

                {/* Housekeeping Status */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Housekeeping
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Cleaned:</span>
                      <span className="font-medium">
                        {bed.housekeeping?.lastCleaned ? 
                          new Date(bed.housekeeping.lastCleaned).toLocaleDateString() : "Not recorded"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cleaning Status:</span>
                      <span className={`font-medium ${
                        bed.housekeeping?.cleaningStatus === "Clean" ? "text-green-600" :
                        bed.housekeeping?.cleaningStatus === "In Progress" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {bed.housekeeping?.cleaningStatus || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {bed.status === "Available" && (
                      <button
                        onClick={() => {
                          setSelectedBed(bed);
                          setShowAssignModal(true);
                        }}
                        className="bg-green-50 text-green-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Assign Patient
                      </button>
                    )}
                    
                    {bed.status === "Occupied" && (
                      <>
                        <button
                          onClick={() => dischargeBed(bed._id)}
                          className="bg-blue-50 text-blue-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Discharge
                        </button>
                        <button
                          onClick={() => {
                            setTransferData(prev => ({ ...prev, fromBedId: bed._id }));
                            setShowTransferModal(true);
                          }}
                          className="bg-purple-50 text-purple-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          Transfer
                        </button>
                      </>
                    )}
                    
                    {bed.status === "Cleaning" && (
                      <button
                        onClick={() => updateBedStatus(bed._id, "Available")}
                        className="bg-green-50 text-green-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Clean
                      </button>
                    )}
                    
                    <button
                      onClick={() => updateBedStatus(bed._id, "Maintenance")}
                      className="bg-orange-50 text-orange-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Patient Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Assign Patient to Bed</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedBed(null);
                    setSelectedPatient("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedBed && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Selected Bed</h3>
                    <p className="text-blue-800">
                      {selectedBed.bedNumber} - {selectedBed.wardId?.wardName} 
                      (Floor {selectedBed.location?.floor}, Room {selectedBed.location?.room})
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Patient</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a patient</option>
                    {patients.filter(p => !p.assignedBed).map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.chiefComplaint} (Triage: {patient.triageLevel})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedBed(null);
                      setSelectedPatient("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={assignBed}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    Assign Bed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Patient Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Transfer Patient</h2>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferData({ fromBedId: "", toBedId: "", reason: "", notes: "" });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Bed</label>
                    <select
                      value={transferData.fromBedId}
                      onChange={(e) => setTransferData(prev => ({ ...prev, fromBedId: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select current bed</option>
                      {beds.filter(bed => bed.status === "Occupied").map((bed) => (
                        <option key={bed._id} value={bed._id}>
                          {bed.bedNumber} - {bed.currentPatient?.firstName} {bed.currentPatient?.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Bed</label>
                    <select
                      value={transferData.toBedId}
                      onChange={(e) => setTransferData(prev => ({ ...prev, toBedId: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select destination bed</option>
                      {beds.filter(bed => bed.status === "Available").map((bed) => (
                        <option key={bed._id} value={bed._id}>
                          {bed.bedNumber} - {bed.wardId?.wardName} (Floor {bed.location?.floor}, Room {bed.location?.room})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer Reason *</label>
                  <select
                    value={transferData.reason}
                    onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select reason</option>
                    <option value="Medical Upgrade">Medical Upgrade (ICU)</option>
                    <option value="Medical Downgrade">Medical Downgrade</option>
                    <option value="Isolation Required">Isolation Required</option>
                    <option value="Room Preference">Room Preference</option>
                    <option value="Equipment Needs">Equipment Needs</option>
                    <option value="Ward Closure">Ward Closure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer Notes</label>
                  <textarea
                    value={transferData.notes}
                    onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Additional notes about the transfer..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferData({ fromBedId: "", toBedId: "", reason: "", notes: "" });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={transferPatient}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Transfer Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Bed Modal */}
        {showAddBedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New Bed</h2>
                <button
                  onClick={() => setShowAddBedModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Number *</label>
                    <input
                      type="text"
                      value={newBed.bedNumber}
                      onChange={(e) => setNewBed(prev => ({ ...prev, bedNumber: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., ICU-001, ER-12"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ward *</label>
                    <select
                      value={newBed.wardId}
                      onChange={(e) => setNewBed(prev => ({ ...prev, wardId: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Ward</option>
                      {wards.map((ward) => (
                        <option key={ward._id} value={ward._id}>{ward.wardName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Type</label>
                    <select
                      value={newBed.bedType}
                      onChange={(e) => setNewBed(prev => ({ ...prev, bedType: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="ICU">ICU</option>
                      <option value="Isolation">Isolation</option>
                      <option value="Pediatric">Pediatric</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Surgery Recovery">Surgery Recovery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Floor *</label>
                    <input
                      type="number"
                      value={newBed.floor}
                      onChange={(e) => setNewBed(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                    <input
                      type="text"
                      value={newBed.room}
                      onChange={(e) => setNewBed(prev => ({ ...prev, room: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 101, 205A"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Position</label>
                    <input
                      type="text"
                      value={newBed.position}
                      onChange={(e) => setNewBed(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A, B (for multi-bed rooms)"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddBedModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addBed}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Add Bed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Analytics */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Bed className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{beds.length}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Beds</div>
            <div className="text-sm text-blue-600 font-semibold">Hospital-wide</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {beds.length > 0 ? Math.round((beds.filter(b => b.status === "Available").length / beds.length) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Availability Rate</div>
            <div className="text-sm text-green-600 font-semibold">Ready for patients</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {beds.filter(b => b.status === "Occupied").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Current Patients</div>
            <div className="text-sm text-purple-600 font-semibold">Active admissions</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {beds.filter(b => ["Cleaning", "Maintenance"].includes(b.status)).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Maintenance/Cleaning</div>
            <div className="text-sm text-yellow-600 font-semibold">In progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(BedManagement, ["receptionist", "nurse", "admin", "er"]);