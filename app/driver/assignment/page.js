"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import dynamic from "next/dynamic";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Route,
  Fuel,
  Radio,
  User,
  Heart,
  Timer,
  Play,
  Square,
  RefreshCw,
  Calendar
} from "lucide-react";

// Dynamic import for map component
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
      <div className="text-center text-gray-600">
        <MapPin className="w-12 h-12 mx-auto mb-2" />
        <p>Loading navigation map...</p>
      </div>
    </div>
  )
});

function DriverAssignment() {
  const { data: session } = useSession();
  const [assignment, setAssignment] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [driverLocation, setDriverLocation] = useState(null);
  const [incidentLocation, setIncidentLocation] = useState(null);
  const [routeStarted, setRouteStarted] = useState(false);
  const [eta, setEta] = useState(null);

  useEffect(() => {
    fetchAssignment();
    updateDriverLocation();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAssignment();
      updateDriverLocation();
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchAssignment = async () => {
    try {
      const res = await fetch("/api/driver/assignment");
      const data = await res.json();
      if (res.ok) {
        setAssignment(data.assignment);
        setVehicle(data.vehicle);
        
        // Set incident location if assignment exists
        if (data.assignment && data.assignment.coordinates) {
          setIncidentLocation([
            data.assignment.coordinates.latitude,
            data.assignment.coordinates.longitude
          ]);
        }
        
        if (data.message) {
          setMessage(data.message);
        }
      } else {
        setMessage(data.error || "Error fetching assignment");
      }
    } catch (error) {
      setMessage("Error fetching assignment");
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setDriverLocation(location);
          
          // Update ambulance location
          try {
            await fetch("/api/driver/location", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: `Driver Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
              }),
            });
          } catch (error) {
            console.error("Error updating location");
          }
        },
        (error) => {
          setMessage(`Location error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    }
  };

  const startRoute = () => {
    if (assignment && assignment.address) {
      const address = encodeURIComponent(assignment.address);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
      window.open(url, '_blank');
      setRouteStarted(true);
      setMessage("Navigation started - follow GPS directions");
      
      // Calculate ETA (mock calculation)
      setEta(new Date(Date.now() + 15 * 60000)); // 15 minutes from now
    }
  };

  const updateStatus = async (status) => {
    if (!assignment) return;
    
    try {
      const res = await fetch("/api/emergency/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: assignment._id,
          status
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Status updated to ${status}`);
        fetchAssignment();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating status");
    }
  };

  const contactDispatch = () => {
    const dispatchNumber = "911"; // In real system, this would be the dispatch center number
    window.open(`tel:${dispatchNumber}`, '_self');
  };

  const getStatusColor = (status) => {
    const colors = {
      "Dispatched": "bg-blue-100 text-blue-700 border-blue-200",
      "En Route": "bg-purple-100 text-purple-700 border-purple-200",
      "On Scene": "bg-orange-100 text-orange-700 border-orange-200",
      "Transporting": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "Completed": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading assignment...</p>
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
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Current Assignment</h1>
                  <p className="text-gray-600 text-xl">Driver: {session?.user.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchAssignment();
                  updateDriverLocation();
                }}
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
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
                  <div className="text-lg font-bold text-purple-600">{vehicle.fuelLevel || 85}%</div>
                  <div className="text-sm text-purple-600">Fuel Level</div>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-600">{vehicle.radioChannel || "CH-7"}</div>
                  <div className="text-sm text-yellow-600">Radio Channel</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-lg ${
            message.includes("updated") || message.includes("started") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("error") || message.includes("Error")
              ? "bg-red-50 border-red-500 text-red-700"
              : "bg-blue-50 border-blue-500 text-blue-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.includes("updated") || message.includes("started") ? "bg-green-500" : 
                message.includes("error") || message.includes("Error") ? "bg-red-500" : "bg-blue-500"
              }`}>
                <span className="text-white text-xs font-bold">
                  {message.includes("updated") || message.includes("started") ? "✓" : 
                   message.includes("error") || message.includes("Error") ? "!" : "i"}
                </span>
              </div>
              <p className="font-semibold">{message}</p>
            </div>
          </div>
        )}

        {assignment ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Assignment Details */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8" />
                  Emergency Assignment
                </h2>
                <p className="text-red-100">Active emergency response details</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-4">{assignment.incidentNumber}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(assignment.priority)}`}>
                          <Heart className="w-4 h-4" />
                          {assignment.priority}
                        </span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Emergency Type</p>
                        <p className="text-gray-900 font-bold">{assignment.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Patient</p>
                        <p className="text-gray-900">{assignment.patientName || "Unknown"}</p>
                        {assignment.patientAge && (
                          <p className="text-gray-600 text-sm">{assignment.patientAge} years old</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 font-medium">Dispatch Time</p>
                      <p className="text-gray-900">
                        {assignment.dispatchedAt ? new Date(assignment.dispatchedAt).toLocaleString() : "Not dispatched"}
                      </p>
                    </div>
                    {assignment.reportedAt && (
                      <div>
                        <p className="text-gray-600 font-medium">Reported Time</p>
                        <p className="text-gray-900">{new Date(assignment.reportedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {eta && (
                      <div>
                        <p className="text-gray-600 font-medium">Estimated Arrival</p>
                        <p className="text-orange-600 font-bold">{eta.toLocaleTimeString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 font-medium">Caller</p>
                      <p className="text-gray-900">{assignment.callerName}</p>
                      <p className="text-gray-600 text-sm">{assignment.callerPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Emergency Location
                  </h4>
                  <p className="text-gray-700 mb-2">{assignment.address}</p>
                  {assignment.landmarks && (
                    <p className="text-gray-600 text-sm">Landmarks: {assignment.landmarks}</p>
                  )}
                </div>

                {/* Patient Condition */}
                <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
                  <h4 className="font-bold text-red-900 mb-3">Patient Condition</h4>
                  <p className="text-red-800">{assignment.patientCondition}</p>
                  {assignment.chiefComplaint && (
                    <p className="text-red-700 mt-2">Chief Complaint: {assignment.chiefComplaint}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startRoute}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                  >
                    <Navigation className="w-6 h-6" />
                    Start Navigation
                  </button>
                  
                  <button
                    onClick={contactDispatch}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                  >
                    <Phone className="w-6 h-6" />
                    Contact Dispatch
                  </button>
                </div>

                {/* Status Update Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {assignment.status === "Dispatched" && (
                    <button
                      onClick={() => updateStatus("En Route")}
                      className="bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Mark En Route
                    </button>
                  )}
                  
                  {assignment.status === "En Route" && (
                    <button
                      onClick={() => updateStatus("On Scene")}
                      className="bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" />
                      Mark On Scene
                    </button>
                  )}
                  
                  {assignment.status === "On Scene" && (
                    <button
                      onClick={() => updateStatus("Transporting")}
                      className="bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck className="w-5 h-5" />
                      Begin Transport
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Map */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <MapPin className="w-8 h-8" />
                  Live Navigation
                </h2>
                <p className="text-blue-100">Real-time route tracking and navigation</p>
              </div>

              <div className="p-6">
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-800 font-semibold">Route Status</p>
                      <p className="text-blue-700 text-sm">
                        {routeStarted ? "Navigation Active" : "Ready to Navigate"}
                      </p>
                    </div>
                    <div className="text-right">
                      {eta && (
                        <>
                          <p className="text-blue-800 font-semibold">ETA</p>
                          <p className="text-blue-700 text-sm">{eta.toLocaleTimeString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <LiveMap
                  incidentLocation={incidentLocation}
                  ambulanceLocation={driverLocation}
                  onNavigate={() => setRouteStarted(true)}
                  emergency={assignment}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Truck className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Active Assignment</h3>
            <p className="text-gray-600 text-lg mb-8">
              You are currently on standby. Wait for emergency dispatch or contact your supervisor.
            </p>
            
            {/* Standby Actions */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={contactDispatch}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <Phone className="w-6 h-6" />
                Contact Dispatch
              </button>
              
              <button
                onClick={() => window.location.href = '/driver/vehicle-check'}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <CheckCircle className="w-6 h-6" />
                Vehicle Check
              </button>
            </div>
          </div>
        )}

        {/* Driver Performance Stats */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <Route className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {assignment ? 1 : 0}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Active Assignments</div>
            <div className="text-sm text-green-600 font-semibold">Current status</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {assignment && assignment.dispatchedAt ? 
                    Math.round((new Date() - new Date(assignment.dispatchedAt)) / 60000) : 0} min
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Response Time</div>
            <div className="text-sm text-green-600 font-semibold">Current call</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {vehicle?.status === "Available" ? "Ready" : vehicle?.status || "Unknown"}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Vehicle Status</div>
            <div className="text-sm text-blue-600 font-semibold">Current state</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Fuel className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{vehicle?.fuelLevel || 85}%</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Fuel Level</div>
            <div className="text-sm text-purple-600 font-semibold">Current tank</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DriverAssignment, ["driver"]);