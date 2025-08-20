"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Route, 
  MapPin, 
  Clock, 
  Calendar, 
  Navigation, 
  Fuel,
  Timer,
  Activity,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search
} from "lucide-react";

function RouteHistory() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRouteHistory();
  }, []);

  const fetchRouteHistory = async () => {
    try {
      // Mock route data for demonstration
      const mockRoutes = [
        {
          id: "1",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          emergencyId: "EMG-20250103-1234",
          startLocation: "Station 3, Main Street",
          destination: "456 Oak Avenue",
          distance: 8.5,
          duration: 12,
          fuelUsed: 2.1,
          status: "Completed",
          priority: "High",
          responseTime: 8,
          patientName: "John Smith"
        },
        {
          id: "2", 
          date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          emergencyId: "EMG-20250103-1156",
          startLocation: "General Hospital",
          destination: "789 Pine Street",
          distance: 12.3,
          duration: 18,
          fuelUsed: 3.2,
          status: "Completed",
          priority: "Critical",
          responseTime: 6,
          patientName: "Mary Johnson"
        },
        {
          id: "3",
          date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          emergencyId: "EMG-20250103-0945",
          startLocation: "Station 3, Main Street", 
          destination: "321 Elm Street",
          distance: 5.7,
          duration: 9,
          fuelUsed: 1.4,
          status: "Completed",
          priority: "Medium",
          responseTime: 11,
          patientName: "Robert Davis"
        },
        {
          id: "4",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          emergencyId: "EMG-20250102-1630",
          startLocation: "Station 3, Main Street",
          destination: "654 Maple Drive",
          distance: 15.2,
          duration: 25,
          fuelUsed: 4.1,
          status: "Completed",
          priority: "High",
          responseTime: 14,
          patientName: "Sarah Wilson"
        }
      ];
      
      setRoutes(mockRoutes);
    } catch (error) {
      console.error("Error fetching route history");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.emergencyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || route.priority.toLowerCase() === filter.toLowerCase();
    
    // Date range filtering
    const routeDate = new Date(route.date);
    const now = new Date();
    let matchesDate = true;
    
    if (dateRange === "today") {
      matchesDate = routeDate.toDateString() === now.toDateString();
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = routeDate >= weekAgo;
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = routeDate >= monthAgo;
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const calculateStats = () => {
    return {
      totalRoutes: filteredRoutes.length,
      totalDistance: filteredRoutes.reduce((sum, route) => sum + route.distance, 0),
      totalDuration: filteredRoutes.reduce((sum, route) => sum + route.duration, 0),
      avgResponseTime: filteredRoutes.length > 0 ? 
        Math.round(filteredRoutes.reduce((sum, route) => sum + route.responseTime, 0) / filteredRoutes.length) : 0,
      totalFuel: filteredRoutes.reduce((sum, route) => sum + route.fuelUsed, 0)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading route history...</p>
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
                  <Route className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Route History</h1>
                  <p className="text-gray-600 text-xl">Track your emergency response routes and performance</p>
                </div>
              </div>
              <button className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105">
                <Download className="w-6 h-6" />
                Export Report
              </button>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.totalRoutes}</div>
                <div className="text-sm text-blue-600">Total Routes</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.totalDistance.toFixed(1)} km</div>
                <div className="text-sm text-green-600">Distance</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</div>
                <div className="text-sm text-purple-600">Drive Time</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{stats.avgResponseTime} min</div>
                <div className="text-sm text-orange-600">Avg Response</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{stats.totalFuel.toFixed(1)}L</div>
                <div className="text-sm text-yellow-600">Fuel Used</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by emergency ID, destination, or patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Route History */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Route className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Routes Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || filter !== "all" || dateRange !== "all" ? "No routes match your current filters." : "No routes have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      <Route className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{route.emergencyId}</h3>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(route.priority)}`}>
                          {route.priority === "Critical" && <AlertTriangle className="w-4 h-4" />}
                          {route.priority}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-4 h-4" />
                          {route.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span><strong>From:</strong> {route.startLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Navigation className="w-4 h-4 text-blue-500" />
                          <span><strong>To:</strong> {route.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span><strong>Duration:</strong> {route.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span><strong>Time:</strong> {route.date.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="text-lg font-bold text-blue-600">{route.distance} km</div>
                      <div className="text-xs text-blue-600">Distance</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-600">{route.responseTime} min</div>
                      <div className="text-xs text-green-600">Response</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <div className="text-lg font-bold text-yellow-600">{route.fuelUsed}L</div>
                      <div className="text-xs text-yellow-600">Fuel</div>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Patient</p>
                      <p className="text-gray-900 font-semibold">{route.patientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900">{route.date.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Avg Speed</p>
                      <p className="text-gray-900">{Math.round((route.distance / (route.duration / 60)) * 10) / 10} km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Analytics */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime} min</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Response Time</div>
            <div className="text-sm text-green-600 font-semibold">-2 min improvement</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalDistance > 0 ? Math.round((stats.totalDistance / stats.totalFuel) * 10) / 10 : 0} km/L
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Fuel Efficiency</div>
            <div className="text-sm text-green-600 font-semibold">Above average</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">98%</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Safety Score</div>
            <div className="text-sm text-green-600 font-semibold">Excellent rating</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{Math.round(stats.totalDuration / 60)}h</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Total Drive Time</div>
            <div className="text-sm text-blue-600 font-semibold">This period</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(RouteHistory, ["driver"]);