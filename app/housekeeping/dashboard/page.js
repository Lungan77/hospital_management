"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Sparkles, 
  Bed, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  Activity,
  RefreshCw,
  Building,
  Timer,
  Star,
  TrendingUp,
  BarChart3,
  Save,
  MapPin
} from "lucide-react";

function HousekeepingDashboard() {
  const [cleaningTasks, setCleaningTasks] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedBed, setSelectedBed] = useState(null);
  const [cleaningData, setCleaningData] = useState({
    cleaningType: "Standard",
    cleaningNotes: "",
    cleaningDuration: ""
  });

  useEffect(() => {
    fetchCleaningTasks();
    fetchCompletedTasks();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchCleaningTasks();
      fetchCompletedTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCleaningTasks = async () => {
    try {
      const res = await fetch("/api/beds/housekeeping");
      const data = await res.json();
      if (res.ok) {
        setCleaningTasks(data.beds || []);
      } else {
        setMessage("Error loading cleaning tasks");
      }
    } catch (error) {
      setMessage("Error fetching cleaning tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const res = await fetch("/api/beds/housekeeping/completed");
      const data = await res.json();
      if (res.ok) {
        setCompletedToday(data.beds || []);
      }
    } catch (error) {
      console.error("Error fetching completed tasks");
    }
  };

  const startCleaning = async (bedId) => {
    try {
      const res = await fetch("/api/beds/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bedId, 
          status: "Cleaning"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchCleaningTasks();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error starting cleaning");
    }
  };

  const completeCleaning = async () => {
    if (!selectedBed) return;

    try {
      const res = await fetch("/api/beds/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedId: selectedBed._id,
          ...cleaningData
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchCleaningTasks();
        fetchCompletedTasks();
        setSelectedBed(null);
        setCleaningData({
          cleaningType: "Standard",
          cleaningNotes: "",
          cleaningDuration: ""
        });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error completing cleaning");
    }
  };

  const getCleaningTypeColor = (type) => {
    const colors = {
      "Standard": "bg-blue-100 text-blue-700 border-blue-200",
      "Deep Clean": "bg-purple-100 text-purple-700 border-purple-200",
      "Isolation": "bg-red-100 text-red-700 border-red-200",
      "Terminal": "bg-orange-100 text-orange-700 border-orange-200"
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityLevel = (bed) => {
    if (bed.wardId?.wardType === "ICU") return { level: "Critical", color: "red" };
    if (bed.wardId?.wardType === "Emergency") return { level: "High", color: "orange" };
    if (bed.bedType === "Isolation") return { level: "High", color: "red" };
    return { level: "Standard", color: "blue" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading housekeeping dashboard...</p>
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
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Housekeeping Dashboard</h1>
                  <p className="text-gray-600 text-xl">Hospital bed cleaning and maintenance coordination</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchCleaningTasks();
                  fetchCompletedTasks();
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
            
            {/* Housekeeping Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{cleaningTasks.length}</div>
                <div className="text-sm text-red-600">Beds Need Cleaning</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {cleaningTasks.filter(bed => bed.status === "Cleaning").length}
                </div>
                <div className="text-sm text-yellow-600">Currently Cleaning</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
                <div className="text-sm text-green-600">Completed Today</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {cleaningTasks.filter(bed => getPriorityLevel(bed).level === "Critical").length}
                </div>
                <div className="text-sm text-blue-600">High Priority</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("completed") || message.includes("available")
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("completed") || message.includes("available") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("completed") || message.includes("available") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Cleaning Tasks */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Beds Requiring Cleaning</h2>
            <p className="text-red-100">Priority cleaning tasks for patient turnover</p>
          </div>

          <div className="p-6">
            {cleaningTasks.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">All Beds Clean</h3>
                <p className="text-gray-600">No beds currently require cleaning</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {cleaningTasks.map((bed) => {
                  const priority = getPriorityLevel(bed);
                  return (
                    <div key={bed._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                            <Bed className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{bed.bedNumber}</h3>
                            <p className="text-gray-600 text-sm">{bed.wardId?.wardName}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          priority.level === "Critical" ? "bg-red-100 text-red-700" :
                          priority.level === "High" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {priority.level}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-medium">Floor {bed.location?.floor}, Room {bed.location?.room}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bed Type:</span>
                          <span className="font-medium">{bed.bedType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className={`font-medium ${
                            bed.status === "Cleaning" ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {bed.housekeeping?.cleaningStatus || "Needs Cleaning"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {bed.status !== "Cleaning" ? (
                          <button
                            onClick={() => startCleaning(bed._id)}
                            className="bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Timer className="w-4 h-4" />
                            Start Cleaning
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedBed(bed)}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const address = `Floor ${bed.location?.floor}, Room ${bed.location?.room}`;
                            alert(`Navigate to: ${address}`);
                          }}
                          className="bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Locate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks Today */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Completed Today</h2>
            <p className="text-green-100">Successfully cleaned beds ready for patients</p>
          </div>

          <div className="p-6">
            {completedToday.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No beds cleaned today yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedToday.map((bed) => (
                  <div key={bed._id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900">{bed.bedNumber}</h4>
                        <p className="text-green-700 text-sm">{bed.wardId?.wardName}</p>
                        <p className="text-green-600 text-xs">
                          Cleaned: {bed.housekeeping?.lastCleaned ? 
                            new Date(bed.housekeeping.lastCleaned).toLocaleTimeString() : "Unknown"}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Complete Cleaning Modal */}
        {selectedBed && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Cleaning - {selectedBed.bedNumber}
                </h2>
                <button
                  onClick={() => setSelectedBed(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AlertTriangle className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Bed Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700"><strong>Bed:</strong> {selectedBed.bedNumber}</p>
                      <p className="text-blue-700"><strong>Ward:</strong> {selectedBed.wardId?.wardName}</p>
                    </div>
                    <div>
                      <p className="text-blue-700"><strong>Location:</strong> Floor {selectedBed.location?.floor}, Room {selectedBed.location?.room}</p>
                      <p className="text-blue-700"><strong>Type:</strong> {selectedBed.bedType}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cleaning Type</label>
                  <select
                    value={cleaningData.cleaningType}
                    onChange={(e) => setCleaningData(prev => ({ ...prev, cleaningType: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Standard">Standard Cleaning</option>
                    <option value="Deep Clean">Deep Clean</option>
                    <option value="Isolation">Isolation Cleaning</option>
                    <option value="Terminal">Terminal Cleaning</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cleaning Duration (minutes)</label>
                  <input
                    type="number"
                    value={cleaningData.cleaningDuration}
                    onChange={(e) => setCleaningData(prev => ({ ...prev, cleaningDuration: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Time spent cleaning"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cleaning Notes</label>
                  <textarea
                    value={cleaningData.cleaningNotes}
                    onChange={(e) => setCleaningData(prev => ({ ...prev, cleaningNotes: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                    placeholder="Any issues found, special cleaning performed, etc."
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedBed(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={completeCleaning}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Mark Clean & Available
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {completedToday.length > 0 ? 
                    Math.round(completedToday.reduce((sum, bed) => 
                      sum + (bed.housekeeping?.cleaningDuration || 30), 0) / completedToday.length) : 0} min
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Cleaning Time</div>
            <div className="text-sm text-blue-600 font-semibold">Per bed today</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {cleaningTasks.length + completedToday.length > 0 ? 
                    Math.round((completedToday.length / (cleaningTasks.length + completedToday.length)) * 100) : 100}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Completion Rate</div>
            <div className="text-sm text-green-600 font-semibold">Today&apos;s progress</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">A+</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Quality Score</div>
            <div className="text-sm text-purple-600 font-semibold">Excellent standards</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {cleaningTasks.filter(bed => getPriorityLevel(bed).level === "Critical").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Priority Tasks</div>
            <div className="text-sm text-orange-600 font-semibold">Requires immediate attention</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HousekeepingDashboard, ["admin", "nurse", "receptionist", "ward_manager"]);