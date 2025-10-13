"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import {
  Building,
  Plus,
  Edit,
  Bed,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Eye,
  X,
  Save,
  RefreshCw,
  Search,
  Trash2,
  ArrowRight
} from "lucide-react";

function WardManagement() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignBedModal, setShowAssignBedModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [newWard, setNewWard] = useState({
    wardName: "",
    wardCode: "",
    wardType: "Medical",
    location: {
      building: "",
      floor: 1,
      wing: "",
      description: ""
    },
    capacity: {
      totalBeds: 0
    },
    specifications: {
      isolationCapable: false,
      oxygenSupply: true,
      suctionSystem: false,
      cardiacMonitoring: false,
      emergencyEquipment: false,
      visitorPolicy: "Open",
      ageRestriction: "All Ages"
    },
    operatingHours: {
      admissionHours: "24/7",
      visitorHours: "08:00-20:00",
      quietHours: "22:00-06:00"
    },
    wardStatus: "Operational"
  });

  const [bedAssignment, setBedAssignment] = useState({
    bedId: "",
    wardId: ""
  });

  useEffect(() => {
    fetchWards();
    fetchBeds();
    const interval = setInterval(() => {
      fetchWards();
      fetchBeds();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWards = async () => {
    try {
      const res = await fetch("/api/wards");
      const data = await res.json();
      if (res.ok) {
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error("Error fetching wards");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async () => {
    try {
      const res = await fetch("/api/beds");
      const data = await res.json();
      if (res.ok) {
        setBeds(data.beds || []);
      }
    } catch (error) {
      console.error("Error fetching beds");
    }
  };

  const handleAddWard = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/wards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWard),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Ward created successfully");
        fetchWards();
        setShowAddModal(false);
        resetForm();
      } else {
        setMessage(data.error || "Error creating ward");
      }
    } catch (error) {
      setMessage("Error creating ward");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWard = async () => {
    if (!selectedWard) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/wards/${selectedWard._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedWard),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Ward updated successfully");
        fetchWards();
        setShowEditModal(false);
        setSelectedWard(null);
      } else {
        setMessage(data.error || "Error updating ward");
      }
    } catch (error) {
      setMessage("Error updating ward");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignBed = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/wards/assign-bed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bedAssignment),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchWards();
        fetchBeds();
        setShowAssignBedModal(false);
        setBedAssignment({ bedId: "", wardId: "" });
      } else {
        setMessage(data.error || "Error assigning bed");
      }
    } catch (error) {
      setMessage("Error assigning bed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWard = async (wardId) => {
    if (!confirm("Are you sure you want to deactivate this ward?")) return;

    try {
      const res = await fetch(`/api/wards/${wardId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Ward deactivated successfully");
        fetchWards();
      } else {
        setMessage(data.error || "Error deactivating ward");
      }
    } catch (error) {
      setMessage("Error deactivating ward");
    }
  };

  const resetForm = () => {
    setNewWard({
      wardName: "",
      wardCode: "",
      wardType: "Medical",
      location: {
        building: "",
        floor: 1,
        wing: "",
        description: ""
      },
      capacity: {
        totalBeds: 0
      },
      specifications: {
        isolationCapable: false,
        oxygenSupply: true,
        suctionSystem: false,
        cardiacMonitoring: false,
        emergencyEquipment: false,
        visitorPolicy: "Open",
        ageRestriction: "All Ages"
      },
      operatingHours: {
        admissionHours: "24/7",
        visitorHours: "08:00-20:00",
        quietHours: "22:00-06:00"
      },
      wardStatus: "Operational"
    });
  };

  const filteredWards = wards.filter(ward =>
    ward.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ward.wardCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableBeds = (wardId) => {
    return beds.filter(bed => !bed.wardId || bed.wardId._id === wardId);
  };

  const getWardBeds = (wardId) => {
    return beds.filter(bed => bed.wardId?._id === wardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading ward management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Ward Management</h1>
                <p className="text-gray-600 text-lg">Create and manage hospital wards</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Ward
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search wards by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowAssignBedModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Bed className="w-5 h-5" />
              Assign Bed to Ward
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWards.map((ward) => {
            const wardBeds = getWardBeds(ward._id);
            return (
              <div
                key={ward._id}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{ward.wardName}</h3>
                    <p className="text-sm text-gray-600 font-semibold">Code: {ward.wardCode}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ward.wardType === "ICU" ? "bg-red-100 text-red-700" :
                    ward.wardType === "Emergency" ? "bg-orange-100 text-orange-700" :
                    ward.wardType === "Pediatric" ? "bg-pink-100 text-pink-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {ward.wardType}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {ward.location.building}, Floor {ward.location.floor}
                      {ward.location.wing && ` - ${ward.location.wing}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-blue-600 font-semibold">Total Beds</div>
                      <div className="text-2xl font-bold text-blue-700">{wardBeds.length}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <div className="text-green-600 font-semibold">Available</div>
                      <div className="text-2xl font-bold text-green-700">
                        {ward.capacity?.availableBeds || 0}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <div className="text-orange-600 font-semibold">Occupied</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {ward.capacity?.occupiedBeds || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <div className="text-purple-600 font-semibold">Occupancy</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {ward.metrics?.occupancyRate || 0}%
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-xl text-center font-semibold text-sm ${
                    ward.wardStatus === "Operational" ? "bg-green-100 text-green-700" :
                    ward.wardStatus === "Limited Capacity" ? "bg-yellow-100 text-yellow-700" :
                    ward.wardStatus === "Emergency Only" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {ward.wardStatus}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedWard(ward);
                      setShowEditModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWard(ward._id)}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWards.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No wards found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first ward</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Ward
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Add New Ward</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Name *
                  </label>
                  <input
                    type="text"
                    value={newWard.wardName}
                    onChange={(e) => setNewWard({...newWard, wardName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., General Medicine Ward A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Code *
                  </label>
                  <input
                    type="text"
                    value={newWard.wardCode}
                    onChange={(e) => setNewWard({...newWard, wardCode: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GMA-01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Type *
                  </label>
                  <select
                    value={newWard.wardType}
                    onChange={(e) => setNewWard({...newWard, wardType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Surgical">Surgical</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Isolation">Isolation</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Status
                  </label>
                  <select
                    value={newWard.wardStatus}
                    onChange={(e) => setNewWard({...newWard, wardStatus: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Limited Capacity">Limited Capacity</option>
                    <option value="Emergency Only">Emergency Only</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Building *
                    </label>
                    <input
                      type="text"
                      value={newWard.location.building}
                      onChange={(e) => setNewWard({...newWard, location: {...newWard.location, building: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Main Building"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Floor *
                    </label>
                    <input
                      type="number"
                      value={newWard.location.floor}
                      onChange={(e) => setNewWard({...newWard, location: {...newWard.location, floor: parseInt(e.target.value)}})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Wing
                    </label>
                    <input
                      type="text"
                      value={newWard.location.wing}
                      onChange={(e) => setNewWard({...newWard, location: {...newWard.location, wing: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., East Wing"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newWard.specifications.isolationCapable}
                      onChange={(e) => setNewWard({...newWard, specifications: {...newWard.specifications, isolationCapable: e.target.checked}})}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-semibold text-gray-700">Isolation Capable</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newWard.specifications.oxygenSupply}
                      onChange={(e) => setNewWard({...newWard, specifications: {...newWard.specifications, oxygenSupply: e.target.checked}})}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-semibold text-gray-700">Oxygen Supply</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newWard.specifications.cardiacMonitoring}
                      onChange={(e) => setNewWard({...newWard, specifications: {...newWard.specifications, cardiacMonitoring: e.target.checked}})}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-semibold text-gray-700">Cardiac Monitoring</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newWard.specifications.emergencyEquipment}
                      onChange={(e) => setNewWard({...newWard, specifications: {...newWard.specifications, emergencyEquipment: e.target.checked}})}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-semibold text-gray-700">Emergency Equipment</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWard}
                disabled={saving || !newWard.wardName || !newWard.wardCode || !newWard.location.building}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Ward
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedWard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Edit Ward</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWard(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Name
                  </label>
                  <input
                    type="text"
                    value={selectedWard.wardName}
                    onChange={(e) => setSelectedWard({...selectedWard, wardName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ward Status
                  </label>
                  <select
                    value={selectedWard.wardStatus}
                    onChange={(e) => setSelectedWard({...selectedWard, wardStatus: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Limited Capacity">Limited Capacity</option>
                    <option value="Emergency Only">Emergency Only</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={selectedWard.notes || ""}
                  onChange={(e) => setSelectedWard({...selectedWard, notes: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this ward..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWard(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWard}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Ward
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignBedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Assign Bed to Ward</h2>
              <button
                onClick={() => {
                  setShowAssignBedModal(false);
                  setBedAssignment({ bedId: "", wardId: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Bed
                </label>
                <select
                  value={bedAssignment.bedId}
                  onChange={(e) => setBedAssignment({...bedAssignment, bedId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a bed...</option>
                  {beds.filter(bed => bed.status !== "Occupied").map((bed) => (
                    <option key={bed._id} value={bed._id}>
                      {bed.bedNumber} - {bed.wardId ? `Current: ${bed.wardId.wardName}` : 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign to Ward
                </label>
                <select
                  value={bedAssignment.wardId}
                  onChange={(e) => setBedAssignment({...bedAssignment, wardId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a ward...</option>
                  {wards.map((ward) => (
                    <option key={ward._id} value={ward._id}>
                      {ward.wardName} ({ward.wardCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignBedModal(false);
                  setBedAssignment({ bedId: "", wardId: "" });
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBed}
                disabled={saving || !bedAssignment.bedId || !bedAssignment.wardId}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Assign Bed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(WardManagement, ["ward_manager", "admin"]);
