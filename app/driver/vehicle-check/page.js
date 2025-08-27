"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Fuel, 
  Wrench,
  Shield,
  Radio,
  Gauge,
  Battery,
  Lightbulb,
  Settings,
  Save,
  RefreshCw,
  Clock,
  User,
  FileText
} from "lucide-react";

function VehicleCheck() {
  const [vehicle, setVehicle] = useState(null);
  const [checkItems, setCheckItems] = useState({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);

  const vehicleCheckItems = [
    { 
      category: "Engine & Mechanical",
      items: [
        { key: "engine", label: "Engine Operation", icon: <Settings className="w-5 h-5" />, critical: true },
        { key: "transmission", label: "Transmission", icon: <Gauge className="w-5 h-5" />, critical: true },
        { key: "brakes", label: "Brake System", icon: <Shield className="w-5 h-5" />, critical: true },
        { key: "steering", label: "Steering", icon: <Settings className="w-5 h-5" />, critical: true },
        { key: "suspension", label: "Suspension", icon: <Wrench className="w-5 h-5" />, critical: false }
      ]
    },
    {
      category: "Electrical & Lighting",
      items: [
        { key: "battery", label: "Battery", icon: <Battery className="w-5 h-5" />, critical: true },
        { key: "headlights", label: "Headlights", icon: <Lightbulb className="w-5 h-5" />, critical: true },
        { key: "emergency_lights", label: "Emergency Lights", icon: <AlertTriangle className="w-5 h-5" />, critical: true },
        { key: "siren", label: "Siren System", icon: <Radio className="w-5 h-5" />, critical: true },
        { key: "radio", label: "Radio Communication", icon: <Radio className="w-5 h-5" />, critical: true }
      ]
    },
    {
      category: "Safety & Emergency",
      items: [
        { key: "seatbelts", label: "Seatbelts", icon: <Shield className="w-5 h-5" />, critical: true },
        { key: "fire_extinguisher", label: "Fire Extinguisher", icon: <AlertTriangle className="w-5 h-5" />, critical: true },
        { key: "first_aid", label: "First Aid Kit", icon: <Shield className="w-5 h-5" />, critical: true },
        { key: "reflective_triangles", label: "Reflective Triangles", icon: <AlertTriangle className="w-5 h-5" />, critical: false },
        { key: "safety_vest", label: "Safety Vest", icon: <Shield className="w-5 h-5" />, critical: true }
      ]
    },
    {
      category: "Fluids & Maintenance",
      items: [
        { key: "fuel_level", label: "Fuel Level", icon: <Fuel className="w-5 h-5" />, critical: true },
        { key: "oil_level", label: "Oil Level", icon: <Settings className="w-5 h-5" />, critical: true },
        { key: "coolant", label: "Coolant Level", icon: <Gauge className="w-5 h-5" />, critical: true },
        { key: "tire_pressure", label: "Tire Pressure", icon: <Gauge className="w-5 h-5" />, critical: true },
        { key: "windshield", label: "Windshield/Mirrors", icon: <Settings className="w-5 h-5" />, critical: true }
      ]
    }
  ];

  useEffect(() => {
    fetchVehicleInfo();
    loadPreviousCheck();
  }, []);

  const fetchVehicleInfo = async () => {
    try {
      const res = await fetch("/api/driver/assignment");
      const data = await res.json();
      if (res.ok && data.vehicle) {
        setVehicle(data.vehicle);
      }
    } catch (error) {
      setMessage("Error fetching vehicle information");
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousCheck = () => {
    // Initialize all items as unchecked
    const initialCheck = {};
    vehicleCheckItems.forEach(category => {
      category.items.forEach(item => {
        initialCheck[item.key] = "unchecked";
      });
    });
    setCheckItems(initialCheck);
  };

  const updateCheckItem = (key, status) => {
    setCheckItems(prev => ({
      ...prev,
      [key]: status
    }));
  };

  const calculateProgress = () => {
    const totalItems = vehicleCheckItems.reduce((sum, category) => sum + category.items.length, 0);
    const checkedItems = Object.values(checkItems).filter(status => status !== "unchecked").length;
    return Math.round((checkedItems / totalItems) * 100);
  };

  const getCriticalIssues = () => {
    const issues = [];
    vehicleCheckItems.forEach(category => {
      category.items.forEach(item => {
        if (item.critical && checkItems[item.key] === "fail") {
          issues.push(item.label);
        }
      });
    });
    return issues;
  };

  const saveVehicleCheck = async () => {
    const criticalIssues = getCriticalIssues();
    
    if (criticalIssues.length > 0) {
      setMessage(`Critical issues found: ${criticalIssues.join(", ")}. Vehicle cannot be used until repaired.`);
      return;
    }

    const uncheckedItems = Object.entries(checkItems).filter(([key, status]) => status === "unchecked");
    if (uncheckedItems.length > 0) {
      setMessage("Please complete all vehicle checks before saving.");
      return;
    }

    setSaving(true);
    setMessage("Saving vehicle check...");
    try {
      const res = await fetch("/api/driver/vehicle-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle?._id,
          checkItems,
          notes,
          completedAt: new Date().toISOString()
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Vehicle check completed successfully. ${data.passed ? 'Vehicle is ready for service.' : 'Vehicle has issues - contact maintenance.'}`);
        setCheckComplete(true);
        
        // Update vehicle info if returned
        if (data.ambulance) {
          setVehicle(prev => ({
            ...prev,
            status: data.ambulance.status,
            lastVehicleCheck: data.ambulance.lastVehicleCheck
          }));
        }
      } else {
        setMessage(data.error || "Error saving vehicle check");
      }
    } catch (error) {
      console.error("Error saving vehicle check:", error);
      setMessage("Error saving vehicle check");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "pass": "bg-green-100 text-green-700 border-green-200",
      "fail": "bg-red-100 text-red-700 border-red-200",
      "unchecked": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "pass": <CheckCircle className="w-4 h-4" />,
      "fail": <AlertTriangle className="w-4 h-4" />,
      "unchecked": <Clock className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading vehicle check...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Vehicle Inspection</h1>
                  <p className="text-gray-600 text-xl">Pre-shift vehicle safety check</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-600">{calculateProgress()}%</div>
                <div className="text-gray-600">Complete</div>
              </div>
            </div>
            
            {/* Vehicle Info */}
            {vehicle && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">{vehicle.callSign}</div>
                  <div className="text-sm text-blue-600">Call Sign</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                  <div className="text-lg font-bold text-green-600">{vehicle.vehicleNumber}</div>
                  <div className="text-sm text-green-600">Vehicle Number</div>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                  <div className="text-lg font-bold text-purple-600">{vehicle.type}</div>
                  <div className="text-sm text-purple-600">Vehicle Type</div>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-600">{vehicle.baseStation}</div>
                  <div className="text-sm text-yellow-600">Base Station</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-lg ${
            message.includes("successfully") || message.includes("ready") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("Critical") || message.includes("cannot")
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("ready") ? "bg-green-500" : 
                message.includes("Critical") || message.includes("cannot") ? "bg-red-500" : "bg-blue-500"
              }`}>
                <span className="text-white text-xs font-bold">
                  {message.includes("successfully") || message.includes("ready") ? "✓" : 
                   message.includes("Critical") || message.includes("cannot") ? "!" : "i"}
                </span>
              </div>
              <p className="font-semibold">{message}</p>
            </div>
          </div>
        )}

        {/* Vehicle Check Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Vehicle Safety Inspection</h2>
            <p className="text-orange-100">Complete all checks before beginning shift</p>
          </div>

          <div className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Inspection Progress</span>
                <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Check Categories */}
            <div className="space-y-8">
              {vehicleCheckItems.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {category.items.map((item) => (
                        <div key={item.key} className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all duration-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                {item.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                                {item.critical && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                    Critical
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(checkItems[item.key] || "unchecked")}`}>
                              {getStatusIcon(checkItems[item.key] || "unchecked")}
                              {checkItems[item.key] === "pass" ? "Pass" : 
                               checkItems[item.key] === "fail" ? "Fail" : "Unchecked"}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => updateCheckItem(item.key, "pass")}
                              className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                                checkItems[item.key] === "pass"
                                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              <CheckCircle className="w-4 h-4 mx-auto mb-1" />
                              Pass
                            </button>
                            
                            <button
                              onClick={() => updateCheckItem(item.key, "fail")}
                              className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                                checkItems[item.key] === "fail"
                                  ? "bg-red-600 text-white shadow-lg transform scale-105"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
                              Fail
                            </button>
                            
                            <button
                              onClick={() => updateCheckItem(item.key, "unchecked")}
                              className={`py-2 px-3 rounded-lg font-semibold transition-all duration-200 ${
                                checkItems[item.key] === "unchecked" || !checkItems[item.key]
                                  ? "bg-gray-600 text-white shadow-lg transform scale-105"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <Clock className="w-4 h-4 mx-auto mb-1" />
                              Reset
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Inspection Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about vehicle condition, issues found, or maintenance needed..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                rows="4"
              />
            </div>

            {/* Critical Issues Warning */}
            {getCriticalIssues().length > 0 && (
              <div className="mt-6 p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">Critical Issues Detected</h3>
                </div>
                <div className="space-y-2">
                  {getCriticalIssues().map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">{issue}</span>
                    </div>
                  ))}
                </div>
                <p className="text-red-700 mt-4 font-semibold">
                  Vehicle cannot be used until these critical issues are resolved. Contact maintenance immediately.
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={saveVehicleCheck}
                disabled={saving || getCriticalIssues().length > 0}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 shadow-xl hover:shadow-orange-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Vehicle Check...
                  </div>
                ) : checkComplete ? (
                  <>
                    <CheckCircle className="w-6 h-6 inline mr-3" />
                    Vehicle Check Complete
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 inline mr-3" />
                    Complete Vehicle Check
                  </>
                )}
              </button>
              
              {calculateProgress() === 100 && getCriticalIssues().length === 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 text-center font-semibold">
                    ✅ All checks passed! Vehicle is ready for emergency response.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Check Summary */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.values(checkItems).filter(status => status === "pass").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Items Passed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.values(checkItems).filter(status => status === "fail").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Items Failed</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.values(checkItems).filter(status => status === "unchecked" || !status).length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Remaining</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {getCriticalIssues().length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Critical Issues</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(VehicleCheck, ["driver"]);