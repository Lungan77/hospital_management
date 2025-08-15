"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Truck, 
  Activity, 
  Clock, 
  Navigation, 
  Radio,
  Fuel,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

// Dynamic import for map component
const FleetMap = dynamic(() => import("@/components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
      <div className="text-center text-gray-600">
        <MapPin className="w-12 h-12 mx-auto mb-2" />
        <p>Loading fleet map...</p>
      </div>
    </div>
  )
});

function FleetTracking() {
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAmbulanceLocations();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchAmbulanceLocations();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAmbulanceLocations = async () => {
    try {
      const res = await fetch("/api/ambulances");
      const data = await res.json();
      if (res.ok) {
        setAmbulances(data.ambulances);
        console.log("Fetched ambulances:", data.ambulances.length);
      }
    } catch (error) {
      console.error("Error fetching ambulance locations");
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    const icons = {
      "Available": <CheckCircle className="w-4 h-4" />,
      "Dispatched": <Activity className="w-4 h-4" />,
      "En Route": <Navigation className="w-4 h-4" />,
      "On Scene": <MapPin className="w-4 h-4" />,
      "Transporting": <Truck className="w-4 h-4" />,
      "Out of Service": <AlertTriangle className="w-4 h-4" />,
      "Maintenance": <Clock className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const updateDriverLocation = async () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch("/api/driver/location", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `Live Tracking: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            console.log("Fleet tracking location updated:", data.message);
            fetchAmbulanceLocations(); // Refresh the map
          } else {
            console.log("Location update failed:", res.status);
          }
        } catch (error) {
          console.error("Error updating fleet tracking location:", error);
        }
      }, (error) => {
        console.log("Fleet tracking geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      });
    } else {
      console.log("Geolocation not available for fleet tracking");
    }
  };

  // Auto-update driver location every 30 seconds if user is a driver
  useEffect(() => {
    updateDriverLocation(); // Initial update
    
    const interval = setInterval(() => {
      updateDriverLocation();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading fleet tracking...</p>
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
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Fleet Tracking</h1>
                  <p className="text-gray-600 text-xl">Real-time ambulance location monitoring and dispatch coordination</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    fetchAmbulanceLocations();
                    setLastUpdate(new Date());
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            {/* Fleet Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{ambulances.filter(a => a.status === "Available").length}</div>
                <div className="text-sm text-green-600">Available</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{ambulances.filter(a => ["Dispatched", "En Route"].includes(a.status)).length}</div>
                <div className="text-sm text-blue-600">En Route</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{ambulances.filter(a => a.status === "On Scene").length}</div>
                <div className="text-sm text-orange-600">On Scene</div>
              </div>
              <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
                <div className="text-2xl font-bold text-cyan-600">{ambulances.filter(a => a.status === "Transporting").length}</div>
                <div className="text-sm text-cyan-600">Transporting</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <MapPin className="w-8 h-8" />
                  Live Fleet Map
                </h2>
                <p className="text-blue-100">Real-time ambulance positions and status</p>
              </div>
              
              <div className="p-6">
                <FleetMap 
                  ambulances={ambulances}
                  onAmbulanceSelect={setSelectedAmbulance}
                  selectedAmbulance={selectedAmbulance}
                />
              </div>
            </div>
          </div>

          {/* Ambulance List */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
                  <Truck className="w-6 h-6" />
                  Active Fleet
                </h2>
                <p className="text-cyan-100">Click to view on map</p>
              </div>
              
              <div className="p-6">
                {ambulances.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No ambulances with location data</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {ambulances.map((ambulance) => (
                      <div
                        key={ambulance._id}
                        onClick={() => setSelectedAmbulance(ambulance)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedAmbulance?._id === ambulance._id
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                              {ambulance.callSign.slice(-2)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{ambulance.callSign}</h3>
                              <p className="text-sm text-gray-600">{ambulance.vehicleNumber}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 ${getStatusColor(ambulance.status)}`}>
                            {getStatusIcon(ambulance.status)}
                            <span className="text-sm font-semibold">{ambulance.status}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{ambulance.currentLocation?.address || "Location unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Updated: {ambulance.currentLocation?.lastUpdated ? 
                                new Date(ambulance.currentLocation.lastUpdated).toLocaleTimeString() : "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ambulance Details */}
            {selectedAmbulance && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Ambulance Details</h2>
                  <p className="text-purple-100">{selectedAmbulance.callSign}</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{selectedAmbulance.fuelLevel || 0}%</div>
                      <div className="text-xs text-blue-600">Fuel</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <Radio className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-bold text-green-600">{selectedAmbulance.radioChannel || "N/A"}</div>
                      <div className="text-xs text-green-600">Radio</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Station:</span>
                      <span className="font-semibold">{selectedAmbulance.baseStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{selectedAmbulance.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crew Size:</span>
                      <span className="font-semibold">{selectedAmbulance.crew?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                        <Radio className="w-4 h-4" />
                        Contact
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedAmbulance.currentLocation?.latitude && selectedAmbulance.currentLocation?.longitude) {
                            const lat = selectedAmbulance.currentLocation.latitude;
                            const lng = selectedAmbulance.currentLocation.longitude;
                            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                          }
                        }}
                        className="bg-green-50 text-green-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(FleetTracking, ["admin", "dispatcher"]);