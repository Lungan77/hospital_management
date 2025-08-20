"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Stethoscope, 
  Heart, 
  Zap, 
  Pill, 
  Shield, 
  Wrench,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  Calendar,
  User,
  MapPin,
  Search,
  Filter,
  RefreshCw
} from "lucide-react";

function ParamedicEquipment() {
  const [equipment, setEquipment] = useState({});
  const [inventory, setInventory] = useState({});
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    quantity: 1,
    minQuantity: 1,
    status: "Operational",
    location: "",
    expiryDate: ""
  });

  useEffect(() => {
    fetchEquipmentStatus();
    checkLowStock();
  }, []);

  const fetchEquipmentStatus = async () => {
    try {
      const res = await fetch("/api/ambulances/equipment/status");
      const data = await res.json();
      if (res.ok) {
        setEquipment(data.equipment);
        setInventory(data.inventory);
        setMessage(data.ambulance ? `Equipment for ${data.ambulance}` : "Equipment status loaded");
      } else {
        setMessage("Error loading equipment status");
      }
    } catch (error) {
      setMessage("Error fetching equipment");
    } finally {
      setLoading(false);
    }
  };

  const checkLowStock = async () => {
    try {
      const res = await fetch("/api/ambulances/equipment/low-stock");
      const data = await res.json();
      if (res.ok) {
        setLowStockItems(data.lowStockItems);
        setExpiredItems(data.expiredItems);
        
        if (data.lowStockItems.length > 0 || data.expiredItems.length > 0) {
          setShowLowStockAlert(true);
        }
      }
    } catch (error) {
      console.error("Error checking low stock");
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
        fetchEquipmentStatus();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating equipment status");
    }
  };

  const updateQuantity = async (equipmentName, newQuantity) => {
    try {
      const res = await fetch("/api/ambulances/equipment/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentName,
          quantity: newQuantity,
          updatedBy: "Paramedic"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        if (data.isLowStock) {
          setMessage(data.message + " - LOW STOCK ALERT!");
        }
        fetchEquipmentStatus();
        checkLowStock();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating quantity");
    }
  };

  const addEquipment = async () => {
    if (!newEquipment.name || !newEquipment.quantity) {
      setMessage("Equipment name and quantity are required");
      return;
    }

    try {
      const res = await fetch("/api/ambulances/equipment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEquipment,
          addedBy: "Paramedic"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchEquipmentStatus();
        setShowAddModal(false);
        setNewEquipment({
          name: "",
          quantity: 1,
          minQuantity: 1,
          status: "Operational",
          location: "",
          expiryDate: ""
        });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error adding equipment");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Operational": "text-green-600 bg-green-100 border-green-200",
      "Needs Maintenance": "text-yellow-600 bg-yellow-100 border-yellow-200",
      "Out of Order": "text-red-600 bg-red-100 border-red-200"
    };
    return colors[status] || "text-gray-600 bg-gray-100 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Operational": <CheckCircle className="w-4 h-4" />,
      "Needs Maintenance": <Wrench className="w-4 h-4" />,
      "Out of Order": <AlertTriangle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const filteredEquipment = Object.entries(equipment).filter(([name, status]) => {
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || status === statusFilter;
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
                  <p className="text-gray-600 text-xl">Manage ambulance equipment and inventory</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    fetchEquipmentStatus();
                    checkLowStock();
                  }}
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
                  {lowStockItems.length}
                </div>
                <div className="text-sm text-red-600">Low Stock Items</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {expiredItems.length}
                </div>
                <div className="text-sm text-purple-600">Expired Items</div>
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
            message.includes("successfully") || message.includes("updated") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("ALERT") || message.includes("LOW STOCK")
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("updated") ? "bg-green-500" : 
                message.includes("ALERT") || message.includes("LOW STOCK") ? "bg-red-500" : "bg-blue-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") || message.includes("updated") ? "✓" : 
                   message.includes("ALERT") || message.includes("LOW STOCK") ? "!" : "i"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Package className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Equipment Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || statusFilter ? "No equipment matches your current filters." : "No equipment has been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEquipment.map(([name, status]) => {
              const inventoryData = inventory[name] || {};
              const isLowStock = inventoryData.quantity <= inventoryData.minQuantity;
              const isExpired = inventoryData.expiryDate && new Date(inventoryData.expiryDate) <= new Date();
              
              return (
                <div key={name} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  {/* Equipment Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          {name.includes("Defibrillator") && <Zap className="w-8 h-8" />}
                          {name.includes("Oxygen") && <Heart className="w-8 h-8" />}
                          {name.includes("Medication") && <Pill className="w-8 h-8" />}
                          {name.includes("Monitor") && <Stethoscope className="w-8 h-8" />}
                          {!["Defibrillator", "Oxygen", "Medication", "Monitor"].some(type => name.includes(type)) && <Package className="w-8 h-8" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                          <p className="text-gray-600">{inventoryData.location || "Unknown Location"}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Inventory Details */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{inventoryData.quantity || 0}</div>
                        <div className="text-xs text-blue-600">Current Stock</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{inventoryData.minQuantity || 1}</div>
                        <div className="text-xs text-purple-600">Minimum Required</div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button
                        onClick={() => updateQuantity(name, Math.max(0, (inventoryData.quantity || 0) - 1))}
                        className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                        {inventoryData.quantity || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(name, (inventoryData.quantity || 0) + 1)}
                        className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Alerts */}
                    {isLowStock && (
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200 mb-3">
                        <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Low Stock Alert - Restock Required
                        </p>
                      </div>
                    )}

                    {isExpired && (
                      <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 mb-3">
                        <p className="text-orange-700 text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Expired - Replace Immediately
                        </p>
                      </div>
                    )}

                    {inventoryData.expiryDate && !isExpired && (
                      <div className="text-sm text-gray-600">
                        <p><strong>Expires:</strong> {new Date(inventoryData.expiryDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Controls */}
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Equipment Status</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {["Operational", "Needs Maintenance", "Out of Order"].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => updateEquipmentStatus(name, statusOption)}
                          className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
                            status === statusOption
                              ? getStatusColor(statusOption) + " shadow-lg transform scale-105"
                              : "border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(statusOption)}
                            {statusOption}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock Alert Modal */}
      {showLowStockAlert && (lowStockItems.length > 0 || expiredItems.length > 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-3xl">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                Equipment Alerts
              </h2>
              <p className="text-red-100">Critical equipment issues require immediate attention</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Low Stock Items */}
              {lowStockItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Low Stock Items
                  </h3>
                  <div className="space-y-3">
                    {lowStockItems.map(([name, data]) => (
                      <div key={name} className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-red-900">{name}</p>
                            <p className="text-red-700 text-sm">
                              Current: {data.quantity} | Required: {data.minQuantity}
                            </p>
                            <p className="text-red-600 text-xs">Location: {data.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-red-600 font-bold">RESTOCK</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Items */}
              {expiredItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Expired Items
                  </h3>
                  <div className="space-y-3">
                    {expiredItems.map(([name, data]) => (
                      <div key={name} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-orange-900">{name}</p>
                            <p className="text-orange-700 text-sm">
                              Expired: {new Date(data.expiryDate).toLocaleDateString()}
                            </p>
                            <p className="text-orange-600 text-xs">Location: {data.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-orange-600 font-bold">REPLACE</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLowStockAlert(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => {
                    setShowLowStockAlert(false);
                    setShowAddModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200"
                >
                  Add Equipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <Plus className="w-6 h-6 rotate-45" />
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
                    placeholder="e.g., Bandages, Splints"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Quantity *</label>
                  <input
                    type="number"
                    value={newEquipment.quantity}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Quantity *</label>
                  <input
                    type="number"
                    value={newEquipment.minQuantity}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="1"
                    required
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location in Ambulance</label>
                  <input
                    type="text"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Main Compartment, Side Compartment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date (if applicable)</label>
                  <input
                    type="date"
                    value={newEquipment.expiryDate}
                    onChange={(e) => setNewEquipment(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    min={new Date().toISOString().split('T')[0]}
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
                  onClick={addEquipment}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200"
                >
                  Add Equipment
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