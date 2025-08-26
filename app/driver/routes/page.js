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
  Search,
  User,
  Phone
} from "lucide-react";

function RouteHistory() {
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    totalRoutes: 0,
    totalDistance: 0,
    totalDuration: 0,
    avgResponseTime: 0,
    totalFuel: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRouteHistory();
  }, []);

  const fetchRouteHistory = async () => {
    try {
      const res = await fetch("/api/driver/routes");
      const data = await res.json();
      if (res.ok) {
        setRoutes(data.routes || []);
        setStats(data.stats || {
          totalRoutes: 0,
          totalDistance: 0,
          totalDuration: 0,
          avgResponseTime: 0,
          totalFuel: 0
        });
      } else {
        console.error("Error fetching routes:", data.error);
      }
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

  const calculateFilteredStats = () => {
    return {
      totalRoutes: filteredRoutes.length,
      totalDistance: Math.round(filteredRoutes.reduce((sum, route) => sum + route.distance, 0) * 10) / 10,
      totalDuration: filteredRoutes.reduce((sum, route) => sum + route.duration, 0),
      avgResponseTime: filteredRoutes.length > 0 ? 
        Math.round(filteredRoutes.filter(r => r.responseTime).reduce((sum, route) => sum + route.responseTime, 0) / filteredRoutes.filter(r => r.responseTime).length) : 0,
      totalFuel: Math.round(filteredRoutes.reduce((sum, route) => sum + route.fuelUsed, 0) * 10) / 10
    };
  };

  const filteredStats = calculateFilteredStats();

  const generateRouteReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Colors
    const colors = {
      primary: [59, 130, 246], // Blue
      secondary: [107, 114, 128], // Gray
      success: [34, 197, 94], // Green
      warning: [245, 158, 11], // Orange
      danger: [239, 68, 68], // Red
      text: [31, 41, 55] // Dark gray
    };

    // Header
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Logo area
    doc.setFillColor(255, 255, 255);
    doc.circle(30, 30, 15, 'F');
    doc.setTextColor(...colors.primary);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EMS", 30, 35, { align: "center" });
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Driver Route History Report", 60, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Emergency Response Route Analysis", 60, 35);
    
    // Report metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 60, 45);
    doc.text(`Period: ${dateRange === "today" ? "Today" : dateRange === "week" ? "This Week" : dateRange === "month" ? "This Month" : "All Time"}`, 60, 52);

    let yPosition = 80;

    // Performance Summary
    doc.setTextColor(...colors.text);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Summary", margin, yPosition);
    yPosition += 15;

    // Performance stats
    const performanceStats = [
      { label: "Total Routes", value: filteredStats.totalRoutes, color: colors.primary },
      { label: "Distance (km)", value: filteredStats.totalDistance, color: colors.success },
      { label: "Drive Time", value: `${Math.round(filteredStats.totalDuration / 60)}h ${filteredStats.totalDuration % 60}m`, color: colors.warning },
      { label: "Avg Response", value: `${filteredStats.avgResponseTime} min`, color: colors.danger }
    ];

    const boxWidth = (pageWidth - 2 * margin - 30) / 4;
    performanceStats.forEach((stat, index) => {
      const x = margin + (index * (boxWidth + 10));
      
      // Box background
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, yPosition, boxWidth, 25, 3, 3, 'F');
      
      // Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(String(stat.value), x + boxWidth/2, yPosition + 10, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(stat.label, x + boxWidth/2, yPosition + 18, { align: "center" });
    });

    yPosition += 45;

    // Route Details Table
    doc.setTextColor(...colors.text);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Route Details", margin, yPosition);
    yPosition += 10;

    // Prepare route table data
    const routeTableData = filteredRoutes.map(route => [
      route.emergencyId,
      new Date(route.date).toLocaleDateString(),
      route.priority,
      route.status,
      `${route.distance} km`,
      `${route.duration} min`,
      route.responseTime ? `${route.responseTime} min` : "N/A",
      `${route.fuelUsed}L`,
      route.destination.substring(0, 25) + (route.destination.length > 25 ? "..." : "")
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Emergency ID', 'Date', 'Priority', 'Status', 'Distance', 'Duration', 'Response', 'Fuel', 'Destination']],
      body: routeTableData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 15, halign: 'center' },
        8: { cellWidth: 35 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin }
    });

    // Efficiency Analysis
    yPosition = doc.lastAutoTable.finalY + 20;
    
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Efficiency Analysis", margin, yPosition);
    yPosition += 10;

    const efficiencyData = [
      ['Fuel Efficiency', `${filteredStats.totalDistance > 0 && filteredStats.totalFuel > 0 ? Math.round((filteredStats.totalDistance / filteredStats.totalFuel) * 10) / 10 : 0} km/L`],
      ['Average Speed', `${filteredStats.totalDuration > 0 ? Math.round((filteredStats.totalDistance / (filteredStats.totalDuration / 60)) * 10) / 10 : 0} km/h`],
      ['Response Time Performance', avgResponseTime <= 10 ? 'Excellent' : avgResponseTime <= 15 ? 'Good' : 'Needs Improvement'],
      ['Total Operating Hours', `${Math.round(filteredStats.totalDuration / 60 * 10) / 10} hours`],
      ['Routes per Day', `${Math.round(filteredStats.totalRoutes / Math.max(1, Math.ceil((new Date() - new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))) * 10) / 10}`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Efficiency Metric', 'Value']],
      body: efficiencyData,
      theme: 'striped',
      headStyles: {
        fillColor: colors.warning,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'center' }
      },
      margin: { left: margin, right: margin }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      // Footer text
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Emergency Medical Services - Driver Performance Report", margin, pageHeight - 15);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 15, { align: "right" });
      doc.text(`Driver: ${session?.user?.name || "Unknown"}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Save the PDF
    const fileName = `Driver_Route_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

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
              <button 
                onClick={() => {
                  // Generate report functionality
                  const reportData = filteredRoutes.map(route => ({
                    emergencyId: route.emergencyId,
                    date: new Date(route.date).toLocaleDateString(),
                    priority: route.priority,
                    distance: route.distance,
                    duration: route.duration,
                    responseTime: route.responseTime,
                    destination: route.destination
                  }));
                  console.log("Route report data:", reportData);
                  alert("Route report generated (check console for data)");
                }}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                Export Report
              </button>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{filteredStats.totalRoutes}</div>
                <div className="text-sm text-blue-600">Total Routes</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{filteredStats.totalDistance} km</div>
                <div className="text-sm text-green-600">Distance</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{Math.round(filteredStats.totalDuration / 60)}h {filteredStats.totalDuration % 60}m</div>
                <div className="text-sm text-purple-600">Drive Time</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{filteredStats.avgResponseTime} min</div>
                <div className="text-sm text-orange-600">Avg Response</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{filteredStats.totalFuel}L</div>
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
                          <span><strong>Date:</strong> {new Date(route.date).toLocaleDateString()}</span>
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
                      <div className="text-lg font-bold text-green-600">{route.responseTime || "N/A"}</div>
                      <div className="text-xs text-green-600">Response (min)</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <div className="text-lg font-bold text-yellow-600">{route.fuelUsed}L</div>
                      <div className="text-xs text-yellow-600">Fuel</div>
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Patient</p>
                      <p className="text-gray-900 font-semibold">{route.patientName || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Emergency Type</p>
                      <p className="text-gray-900">{route.type || "Medical"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Avg Speed</p>
                      <p className="text-gray-900">{route.duration > 0 ? Math.round((route.distance / (route.duration / 60)) * 10) / 10 : 0} km/h</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Time</p>
                      <p className="text-gray-900">{new Date(route.date).toLocaleTimeString()}</p>
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
                <div className="text-2xl font-bold text-gray-900">{filteredStats.avgResponseTime} min</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Response Time</div>
            <div className="text-sm text-green-600 font-semibold">
              {filteredStats.avgResponseTime <= 10 ? "Excellent" : filteredStats.avgResponseTime <= 15 ? "Good" : "Needs Improvement"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredStats.totalDistance > 0 && filteredStats.totalFuel > 0 ? 
                    Math.round((filteredStats.totalDistance / filteredStats.totalFuel) * 10) / 10 : 0} km/L
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
                <div className="text-2xl font-bold text-gray-900">{Math.round(filteredStats.totalDuration / 60)}h</div>
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