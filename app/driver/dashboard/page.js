"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Fuel,
  Route,
  Activity,
  Navigation,
  Phone,
  Settings,
  Calendar,
  BarChart3,
  Star,
  Award,
  RefreshCw,
  User,
  Timer
} from "lucide-react";

function DriverDashboard() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [vehicleStatus, setVehicleStatus] = useState(null);
  const [todayStats, setTodayStats] = useState({
    responses: 0,
    milesDriven: 0,
    hoursActive: 0,
    safetyScore: 0
  });
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [lastVehicleCheck, setLastVehicleCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("🚗 Driver dashboard initializing for:", session?.user.name);
    fetchDriverData();
    updateLocation();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      console.log("🔄 Driver dashboard auto-updating...");
      fetchDriverData();
      updateLocation();
    }, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [session]);

  const updateLocation = () => {
    console.log("🚗 Driver updating location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        console.log("📍 Driver position obtained:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        try {
          const res = await fetch("/api/driver/location", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `Driver ${session?.user.name}: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            }),
          });
          
          const data = await res.json();
          if (res.ok) {
            console.log("✅ Driver location updated:", data.message);
            if (data.ambulance) {
              console.log("🚑 Ambulance updated:", data.ambulance.callSign, "at", data.ambulance.currentLocation);
              setMessage(`Location updated: ${data.ambulance.callSign} at ${new Date().toLocaleTimeString()}`);
            }
          } else {
            console.log("❌ Location update failed:", data.error);
            setMessage(`Location update failed: ${data.error}`);
          }
        } catch (error) {
          console.error("❌ Network error updating location:", error);
          setMessage("Network error updating location");
        }
      }, (error) => {
        console.error("❌ Geolocation error:", error.message);
        setMessage(`Geolocation error: ${error.message}`);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      });
    } else {
      console.log("❌ Geolocation not supported");
      setMessage("Geolocation not supported by this browser");
    }
  };

  const fetchDriverData = async () => {
    try {
      // Fetch current assignment
      const assignmentRes = await fetch("/api/driver/assignment");
      const assignmentData = await assignmentRes.json();
      if (assignmentRes.ok) {
        setCurrentAssignment(assignmentData.assignment);
        setVehicleStatus(assignmentData.vehicle);
      }

      // Fetch route history for today's stats
      const routesRes = await fetch("/api/driver/routes");
      const routesData = await routesRes.json();
      if (routesRes.ok) {
        const routes = routesData.routes || [];
        setRecentRoutes(routes.slice(0, 5)); // Last 5 routes
        
        // Calculate today's stats
        const today = new Date().toDateString();
        const todayRoutes = routes.filter(route => 
          new Date(route.date).toDateString() === today
        );
        
        const stats = {
          responses: todayRoutes.length,
          milesDriven: Math.round(todayRoutes.reduce((sum, route) => sum + (route.distance || 0), 0)),
          hoursActive: Math.round(todayRoutes.reduce((sum, route) => sum + (route.duration || 0), 0) / 60 * 10) / 10,
          safetyScore: routes.length > 0 ? 98 : 100 // Mock safety score
        };
        
        setTodayStats(stats);
      }

      // Fetch last vehicle check
      const checkRes = await fetch("/api/driver/vehicle-check");
      const checkData = await checkRes.json();
      if (checkRes.ok) {
        setLastVehicleCheck(checkData.lastCheck);
      }

    } catch (error) {
      setMessage("Error loading driver data");
    } finally {
      setLoading(false);
    }
  };

  const updateVehicleStatus = async (status) => {
    try {
      const res = await fetch("/api/driver/vehicle-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchDriverData();
      }
    } catch (error) {
      setMessage("Error updating vehicle status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Available": "text-green-600",
      "Dispatched": "text-blue-600",
      "En Route": "text-purple-600",
      "On Scene": "text-orange-600",
      "Transporting": "text-cyan-600",
      "Out of Service": "text-red-600",
      "Maintenance": "text-yellow-600"
    };
    return colors[status] || "text-gray-600";
  };

  const getVehicleCheckStatus = () => {
    if (!lastVehicleCheck) return { status: "needed", color: "red", text: "Check Required" };
    
    const checkDate = new Date(lastVehicleCheck.completedAt);
    const today = new Date();
    const hoursSinceCheck = (today - checkDate) / (1000 * 60 * 60);
    
    if (hoursSinceCheck > 24) return { status: "expired", color: "red", text: "Check Expired" };
    if (!lastVehicleCheck.passed) return { status: "failed", color: "red", text: "Check Failed" };
    return { status: "passed", color: "green", text: "Check Passed" };
  };

  const vehicleCheckStatus = getVehicleCheckStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
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
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Driver Dashboard</h1>
                  <p className="text-gray-600 text-xl">Welcome back, {session?.user.name}</p>
                  {vehicleStatus && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-semibold text-gray-900">{vehicleStatus.callSign}</span>
                      <span className={`text-sm font-medium ${getStatusColor(vehicleStatus.status)}`}>
                        ({vehicleStatus.status})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  fetchDriverData();
                  updateLocation();
                }}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
            
            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{todayStats.responses}</div>
                <div className="text-sm text-blue-600">Responses Today</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{todayStats.milesDriven}</div>
                <div className="text-sm text-green-600">Miles Driven</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{todayStats.hoursActive}h</div>
                <div className="text-sm text-purple-600">Hours Active</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{todayStats.safetyScore}%</div>
                <div className="text-sm text-yellow-600">Safety Score</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-lg ${
            message.includes("updated") || message.includes("successfully") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("error") || message.includes("failed")
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.includes("updated") || message.includes("successfully") ? "bg-green-500" : 
                message.includes("error") || message.includes("failed") ? "bg-red-500" : "bg-blue-500"
              }`}>
                <span className="text-white text-xs font-bold">
                  {message.includes("updated") || message.includes("successfully") ? "✓" : 
                   message.includes("error") || message.includes("failed") ? "!" : "i"}
                </span>
              </div>
              <p className="font-semibold">{message}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Assignment */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Current Assignment
              </h2>
              <p className="text-orange-100">Active emergency response details</p>
            </div>

            <div className="p-8">
              {currentAssignment ? (
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                    <h3 className="font-bold text-red-900 mb-4 text-xl">{currentAssignment.incidentNumber}</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-red-600 font-medium">Priority</p>
                        <p className="text-red-800 font-bold">{currentAssignment.priority}</p>
                      </div>
                      <div>
                        <p className="text-red-600 font-medium">Status</p>
                        <p className="text-red-800 font-bold">{currentAssignment.status}</p>
                      </div>
                      <div>
                        <p className="text-red-600 font-medium">Patient</p>
                        <p className="text-red-800">{currentAssignment.patientName || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-red-600 font-medium">Type</p>
                        <p className="text-red-800">{currentAssignment.type}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-red-600 font-medium">Location</p>
                        <p className="text-red-800">{currentAssignment.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/driver/assignment">
                      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Navigation className="w-5 h-5" />
                        Open Assignment
                      </button>
                    </Link>
                    <button 
                      onClick={() => {
                        if (currentAssignment.address) {
                          const address = encodeURIComponent(currentAssignment.address);
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`, '_blank');
                        }
                      }}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      Navigate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Assignment</h3>
                  <p className="text-gray-600 mb-6">Waiting for emergency dispatch</p>
                  <Link href="/driver/assignment">
                    <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
                      Check for Assignment
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Vehicle Status
              </h2>
              <p className="text-blue-100">Current vehicle condition and readiness</p>
            </div>

            <div className="p-8">
              {vehicleStatus ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <Fuel className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{vehicleStatus.fuelLevel || 85}%</div>
                      <div className="text-sm text-green-600">Fuel Level</div>
                    </div>
                    <div className={`text-center p-4 rounded-xl border ${
                      vehicleCheckStatus.status === "passed" ? "bg-green-50 border-green-200" :
                      vehicleCheckStatus.status === "failed" ? "bg-red-50 border-red-200" :
                      "bg-yellow-50 border-yellow-200"
                    }`}>
                      {vehicleCheckStatus.status === "passed" ? <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" /> :
                       vehicleCheckStatus.status === "failed" ? <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" /> :
                       <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />}
                      <div className={`text-lg font-bold ${
                        vehicleCheckStatus.status === "passed" ? "text-green-600" :
                        vehicleCheckStatus.status === "failed" ? "text-red-600" :
                        "text-yellow-600"
                      }`}>
                        {vehicleCheckStatus.text}
                      </div>
                      <div className={`text-sm ${
                        vehicleCheckStatus.status === "passed" ? "text-green-600" :
                        vehicleCheckStatus.status === "failed" ? "text-red-600" :
                        "text-yellow-600"
                      }`}>
                        Vehicle Check
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Call Sign</span>
                      <span className="font-bold text-gray-900">{vehicleStatus.callSign}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Vehicle Number</span>
                      <span className="font-bold text-gray-900">{vehicleStatus.vehicleNumber}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Radio Channel</span>
                      <span className="font-bold text-gray-900">{vehicleStatus.radioChannel || "CH-7"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">Base Station</span>
                      <span className="font-bold text-gray-900">{vehicleStatus.baseStation}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateVehicleStatus("Available")}
                      disabled={vehicleCheckStatus.status !== "passed"}
                      className="bg-green-50 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Available
                    </button>
                    <button 
                      onClick={() => updateVehicleStatus("Out of Service")}
                      className="bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                    >
                      Out of Service
                    </button>
                  </div>

                  {vehicleCheckStatus.status !== "passed" && (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ Vehicle check required before marking available for service
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Vehicle Assigned</h3>
                  <p className="text-gray-600">Contact dispatch for vehicle assignment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="w-8 h-8 text-orange-600" />
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/driver/assignment" className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200">
              <Activity className="w-12 h-12 text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Current Assignment</h3>
              <p className="text-gray-600 text-sm">View active emergency</p>
              {currentAssignment && (
                <div className="mt-2 text-xs text-orange-600 font-semibold">
                  {currentAssignment.incidentNumber}
                </div>
              )}
            </Link>
            
            <Link href="/driver/vehicle-check" className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Vehicle Check</h3>
              <p className="text-gray-600 text-sm">Pre-shift inspection</p>
              <div className={`mt-2 text-xs font-semibold ${
                vehicleCheckStatus.status === "passed" ? "text-green-600" :
                vehicleCheckStatus.status === "failed" ? "text-red-600" :
                "text-yellow-600"
              }`}>
                {vehicleCheckStatus.text}
              </div>
            </Link>
            
            <Link href="/driver/routes" className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-200">
              <Route className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Route History</h3>
              <p className="text-gray-600 text-sm">View past routes</p>
              <div className="mt-2 text-xs text-green-600 font-semibold">
                {recentRoutes.length} recent routes
              </div>
            </Link>
            
            <button 
              onClick={() => {
                const dispatchNumber = "911";
                window.open(`tel:${dispatchNumber}`, '_self');
              }}
              className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
            >
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Contact Dispatch</h3>
              <p className="text-gray-600 text-sm">Emergency coordination</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="w-8 h-8 text-orange-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentRoutes.length > 0 ? (
              recentRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    route.status === 'Completed' ? 'bg-green-500' :
                    route.status === 'Active' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Emergency Response: {route.emergencyId}</p>
                    <p className="text-sm text-gray-600">{route.destination}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(route.date).toLocaleDateString()}</div>
                    <div>{route.distance}km • {route.duration}min</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.responses}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Emergency Responses</div>
            <div className="text-sm text-green-600 font-semibold">Today</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Route className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.milesDriven}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Miles Driven</div>
            <div className="text-sm text-blue-600 font-semibold">Today</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.hoursActive}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Hours Active</div>
            <div className="text-sm text-purple-600 font-semibold">Current shift</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.safetyScore}%</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Safety Score</div>
            <div className="text-sm text-green-600 font-semibold">Excellent rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);