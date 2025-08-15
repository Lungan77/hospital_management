"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
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
  Award
} from "lucide-react";

function DriverDashboard() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [vehicleStatus, setVehicleStatus] = useState(null);
  const [todayStats, setTodayStats] = useState({
    responses: 0,
    milesDriven: 0,
    hoursActive: 0,
    safetyScore: 98
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDriverData();
    
    // Initial location update after a short delay
    setTimeout(() => {
      updateLocation();
    }, 2000);
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchDriverData();
      updateLocation();
    }, 10000); // Update every 10 seconds for real-time tracking
    return () => clearInterval(interval);
  }, []);

  const updateLocation = () => {
    console.log("Driver updating location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        console.log("Driver position obtained:", position.coords.latitude, position.coords.longitude);
        try {
          const res = await fetch("/api/driver/location", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `Live Driver Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
              timestamp: new Date().toISOString()
            }),
          });
          
          const data = await res.json();
          if (res.ok) {
            console.log("✅ Driver location updated successfully:", data.message);
            if (data.ambulance) {
              console.log("📍 Ambulance location updated:", data.ambulance.callSign, data.ambulance.currentLocation);
            }
          } else {
            console.log("❌ Driver location update failed:", data.error);
          }
        } catch (error) {
          console.error("❌ Error updating driver location:", error);
        }
      }, (error) => {
        console.error("❌ Driver geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      });
    } else {
      console.log("❌ Geolocation not available for driver");
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

      // Fetch today's stats (mock data for now)
      setTodayStats({
        responses: 8,
        milesDriven: 156,
        hoursActive: 6.5,
        safetyScore: 98
      });
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
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Driver Dashboard</h1>
                <p className="text-gray-600 text-xl">Welcome back, {session?.user.name}</p>
              </div>
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
                <div className="text-2xl font-bold text-purple-600">{todayStats.hoursActive}</div>
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
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
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
                      <div className="md:col-span-2">
                        <p className="text-red-600 font-medium">Location</p>
                        <p className="text-red-800">{currentAssignment.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Navigation className="w-5 h-5" />
                      Navigate
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Dispatch
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Assignment</h3>
                  <p className="text-gray-600">Waiting for emergency dispatch</p>
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
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-blue-600">Ready</div>
                      <div className="text-sm text-blue-600">Vehicle Status</div>
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateVehicleStatus("Available")}
                      className="bg-green-50 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-100 transition-colors"
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
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group">
              <CheckCircle className="w-12 h-12 text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Vehicle Check</h3>
              <p className="text-gray-600 text-sm">Pre-shift inspection</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
              <Route className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Route History</h3>
              <p className="text-gray-600 text-sm">View past routes</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Performance</h3>
              <p className="text-gray-600 text-sm">View statistics</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600 text-sm">Dispatch & Support</p>
            </button>
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
            <div className="text-sm text-green-600 font-semibold">+2 from yesterday</div>
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
            <div className="text-sm text-blue-600 font-semibold">+24 from yesterday</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Clock className="w-6 h-6" />
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

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="w-8 h-8 text-orange-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              { time: "14:30", action: "Emergency response completed", location: "Main St & 5th Ave", status: "success" },
              { time: "12:15", action: "Patient transported to hospital", location: "General Hospital", status: "success" },
              { time: "10:45", action: "Vehicle inspection completed", location: "Station 3", status: "info" },
              { time: "09:30", action: "Shift started", location: "Station 3", status: "info" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.location}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DriverDashboard, ["driver"]);