"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Stethoscope,
  Heart,
  Zap,
  Shield,
  Pill,
  Activity,
  Settings,
  Calendar,
  User,
  Save,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X
} from "lucide-react";

function ParamedicEquipment() {
  const [equipment, setEquipment] = useState({});
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);
  const [ambulance, setAmbulance] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    quantity: "",
    minQuantity: "",
    status: "Operational",
    location: "",
    expiryDate: ""
  });

  const [editEquipment, setEditEquipment] = useState({
    name: "",
    quantity: "",
    minQuantity: "",
    status: "Operational",
    location: "",
    expiryDate: ""
  });

  const requiredEquipment = [
    { name: "Defibrillator", icon: <Heart className="w-5 h-5" />, critical: true, color: "red" },
    { name: "Oxygen Tank", icon: <Activity className="w-5 h-5" />, critical: true, color: "blue" },
    { name: "IV Supplies", icon: <Zap className="w-5 h-5" />, critical: true, color: "purple" },
    { name: "Medications", icon: <Pill className="w-5 h-5" />, critical: true, color: "green" },
    { name: "Airway Kit", icon: <Activity className="w-5 h-5" />, critical: true, color: "orange" },
    { name: "Trauma Kit", icon: <Shield className="w-5 h-5" />, critical: true, color: "red" },
    { name: "Cardiac Monitor", icon: <Heart className="w-5 h-5" />, critical: true, color: "pink" },
    { name: "Suction Unit", icon: <Settings className="w-5 h-5" />, critical: true, color: "cyan" },
    { name: "Splinting Supplies", icon: <Shield className="w-5 h-5" />, critical: false, color: "yellow" },
    { name: "Bandages", icon: <Package className="w-5 h-5" />, critical: false, color: "gray" },
    { name: "Thermometer", icon: <Activity className="w-5 h-5" />, critical: false, color: "blue" },
    { name: "Blood Pressure Cuff", icon: <Heart className="w-5 h-5" />, critical: false, color: "red" }
  ];

  useEffect(() => {
    fetchEquipmentStatus();
  }, []);

  const fetchEquipmentStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ambulances/equipment/status");
      const data = await res.json();
      if (res.ok) {
        setEquipment(data.equipment || {});
        setInventory(data.inventory || {});
        setCheckComplete(data.checkComplete || false);
        setAmbulance(data.ambulance || "Unknown");
        setMessage("");
      } else {
        setMessage("Error loading equipment status");
      }
    } catch (error) {
      setMessage("Error fetching equipment data");
    } finally {
      setLoading(false);
    }
  };

  const updateEquipmentStatus = async (equipmentName, status) => {
    try {
      const res = await fetch("/api/ambulances/equipment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentName,
          status,
          checkedBy: "Paramedic"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchEquipmentStatus(); // Refresh data
      } else {
        setMessage(data.error || "Error updating equipment status");
      }
    } catch (error) {
      setMessage("Error updating equipment status");
    }
  };

  const updateEquipmentQuantity = async (equipmentName, quantity) => {
    try {
      const res = await fetch("/api/ambulances/equipment/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentName,
          quantity: parseInt(quantity),
          updatedBy: "Paramedic"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        if (data.isLowStock) {
          setMessage(`${equipmentName} is running low on stock!`);
        }
        fetchEquipmentStatus(); // Refresh data
      } else {
        setMessage(data.error || "Error updating quantity");
      }
    } catch (error) {
      setMessage("Error updating equipment quantity");
    }
  };

  const addNewEquipment = async () => {
    if (!newEquipment.name || !newEquipment.quantity) {
      setMessage("Equipment name and quantity are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ambulances/equipment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEquipment.name,
          quantity: parseInt(newEquipment.quantity),
          minQuantity: parseInt(newEquipment.minQuantity) || 1,
          status: newEquipment.status,
          location: newEquipment.location,
          expiryDate: newEquipment.expiryDate || null,
          addedBy: "Paramedic"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setShowAddModal(false);
        setNewEquipment({
          name: "",
          quantity: "",
          minQuantity: "",
          status: "Operational",
          location: "",
          expiryDate: ""
        });
        fetchEquipmentStatus();
      } else {
        setMessage(data.error || "Error adding equipment");
      }
    } catch (error) {
      setMessage("Error adding equipment");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Operational": "bg-green-100 text-green-700 border-green-200",
      "Needs Maintenance": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Out of Order": "bg-red-100 text-red-700 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Operational": <CheckCircle className="w-4 h-4" />,
      "Needs Maintenance": <Clock className="w-4 h-4" />,
      "Out of Order": <AlertTriangle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const isLowStock = (equipmentName) => {
    const item = inventory[equipmentName];
    return item && item.quantity <= item.minQuantity;
  };

  const isExpired = (equipmentName) => {
    const item = inventory[equipmentName];
    return item && item.expiryDate && new Date(item.expiryDate) <= new Date();
  };

  const filteredEquipment = requiredEquipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || equipment[eq.name] === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading equipment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Equipment Management</h1>
                  <p className="text-gray-600 text-xl">Ambulance: {ambulance}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={fetchEquipmentStatus}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Add Equipment
                </button>
              </div>
            </div>
            
            {/* Equipment Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(equipment).filter(status => status === "Operational").length}
                </div>
                <div className="text-sm text-green-600">Operational</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(equipment).filter(status => status === "Needs Maintenance").length}
                </div>
                <div className="text-sm text-yellow-600">Needs Maintenance</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(equipment).filter(status => status === "Out of Order").length}
                </div>
                <div className="text-sm text-red-600">Out of Order</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {checkComplete ? "100%" : Math.round((Object.values(equipment).filter(status => status === "Operational").length / requiredEquipment.length) * 100)}%
                </div>
                <div className="text-sm text-blue-600">Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="Operational">Operational</option>
                  <option value="Needs Maintenance">Needs Maintenance</option>
                  <option value="Out of Order">Out of Order</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") || message.includes("added") || message.includes("updated")
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("low") || message.includes("stock")
              ? "bg-yellow-50 border-yellow-500 text-yellow-700"
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("added") || message.includes("updated") ? "bg-green-500" : 
                message.includes("low") || message.includes("stock") ? "bg-yellow-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") || message.includes("added") || message.includes("updated") ? "✓" : 
                   message.includes("low") || message.includes("stock") ? "!" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Equipment Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEquipment.map((eq) => {
            const status = equipment[eq.name] || "Unchecked";
            const inventoryItem = inventory[eq.name] || { quantity: 0, minQuantity: 1, location: "Unknown", expiryDate: null };
            const lowStock = isLowStock(eq.name);
            const expired = isExpired(eq.name);

            return (
              <div key={eq.name} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Equipment Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-br from-${eq.color}-500 to-${eq.color}-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {eq.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{eq.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {eq.critical && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                              Critical
                            </span>
                          )}
                          {lowStock && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                              Low Stock
                            </span>
                          )}
                          {expired && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="p-6 border-b border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Quantity</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={inventoryItem.quantity}
                          onChange={(e) => updateEquipmentQuantity(eq.name, e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-center"
                          min="0"
                        />
                        <span className="text-gray-600">/ {inventoryItem.minQuantity} min</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Location</p>
                      <p className="font-semibold text-gray-900">{inventoryItem.location}</p>
                    </div>
                    {inventoryItem.expiryDate && (
                      <div className="col-span-2">
                        <p className="text-gray-500 font-medium">Expiry Date</p>
                        <p className={`font-semibold ${expired ? "text-red-600" : "text-gray-900"}`}>
                          {new Date(inventoryItem.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Controls */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Equipment Status</h4>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={() => updateEquipmentStatus(eq.name, "Operational")}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "Operational"
                          ? "bg-green-600 text-white shadow-lg transform scale-105"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Operational</div>
                    </button>
                    
                    <button
                      onClick={() => updateEquipmentStatus(eq.name, "Needs Maintenance")}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "Needs Maintenance"
                          ? "bg-yellow-600 text-white shadow-lg transform scale-105"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Maintenance</div>
                    </button>
                    
                    <button
                      onClick={() => updateEquipmentStatus(eq.name, "Out of Order")}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                        status === "Out of Order"
                          ? "bg-red-600 text-white shadow-lg transform scale-105"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">Out of Order</div>
                    </button>
                  </div>

                  {/* Alerts */}
                  {(lowStock || expired || status === "Out of Order") && (
                    <div className="space-y-2">
                      {lowStock && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Low stock - restock needed
                          </p>
                        </div>
                      )}
                      {expired && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Equipment expired - replace immediately
                          </p>
                        </div>
                      )}
                      {status === "Out of Order" && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Equipment out of order - repair required
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Equipment Check Status */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-red-600" />
            Equipment Check Status
          </h2>
          
          {checkComplete ? (
            <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">Equipment Check Complete</h3>
              <p className="text-green-700 text-lg">All required equipment is operational and ready for emergency response</p>
            </div>
          ) : (
            <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-200 text-center">
              <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Equipment Check Required</h3>
              <p className="text-yellow-700 text-lg">Please check all required equipment before responding to emergencies</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Equipment</h2>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Name *</label>
                  <input
                    type="text"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Blood Pressure Monitor"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={newEquipment.quantity}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Quantity</label>
                  <input
                    type="number"
                    value={newEquipment.minQuantity}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, minQuantity: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="1"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={newEquipment.status}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Main Compartment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={newEquipment.expiryDate}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  onClick={addNewEquipment}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Equipment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ParamedicEquipment, ["paramedic"]);