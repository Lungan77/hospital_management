"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  User, 
  Activity, 
  Heart,
  AlertTriangle,
  Truck,
  Stethoscope,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Save,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

function ERHandoverVerification() {
  const [handovers, setHandovers] = useState([]);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchHandovers();
    // Set up real-time updates
    const interval = setInterval(fetchHandovers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHandovers = async () => {
    try {
      const res = await fetch("/api/er/handovers");
      const data = await res.json();
      if (res.ok) {
        setHandovers(data.handovers || []);
      } else {
        setMessage("Error fetching handovers");
      }
    } catch (error) {
      setMessage("Error loading handover data");
    } finally {
      setLoading(false);
    }
  };

  const verifyHandover = async (emergencyId) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/er/verify-handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId,
          verificationNotes
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchHandovers();
        setSelectedHandover(null);
        setVerificationNotes("");
      }
    } catch (error) {
      setMessage("Error verifying handover");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending Verification": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Verified": "bg-green-100 text-green-700 border-green-200",
      "Completed": "bg-blue-100 text-blue-700 border-blue-200"
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

  const filteredHandovers = handovers.filter(handover => {
    const matchesSearch = handover.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         handover.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "pending") return !handover.handover?.verified && matchesSearch;
    if (filter === "verified") return handover.handover?.verified && matchesSearch;
    if (filter === "critical") return handover.priority === "Critical" && matchesSearch;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading handovers...</p>
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
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Handover Verification</h1>
                  <p className="text-gray-600 text-xl">Verify and complete patient handovers from EMS</p>
                </div>
              </div>
              <button
                onClick={fetchHandovers}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {handovers.filter(h => !h.handover?.verified).length}
                </div>
                <div className="text-sm text-yellow-600">Pending Verification</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {handovers.filter(h => h.handover?.verified).length}
                </div>
                <div className="text-sm text-green-600">Verified Today</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {handovers.filter(h => h.priority === "Critical").length}
                </div>
                <div className="text-sm text-red-600">Critical Cases</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{handovers.length}</div>
                <div className="text-sm text-blue-600">Total Handovers</div>
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
                  placeholder="Search by incident number or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: "pending", label: "Pending", count: handovers.filter(h => !h.handover?.verified).length },
                { key: "verified", label: "Verified", count: handovers.filter(h => h.handover?.verified).length },
                { key: "critical", label: "Critical", count: handovers.filter(h => h.priority === "Critical").length },
                { key: "all", label: "All", count: handovers.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    filter === tab.key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Handover List */}
        {filteredHandovers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FileText className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Handovers Found</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No patient handovers available." : `No ${filter} handovers found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredHandovers.map((handover) => (
              <div key={handover._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Handover Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Truck className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{handover.incidentNumber}</h2>
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(handover.priority)}`}>
                            {handover.priority === "Critical" && <Heart className="w-4 h-4" />}
                            {handover.priority}
                          </span>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(handover.handover?.verified ? "Verified" : "Pending Verification")}`}>
                            {handover.handover?.verified ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {handover.handover?.verified ? "Verified" : "Pending Verification"}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-green-500" />
                            <span><strong>Patient:</strong> {handover.patientName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span><strong>Arrived:</strong> {handover.arrivedHospitalAt ? new Date(handover.arrivedHospitalAt).toLocaleString() : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Truck className="w-4 h-4 text-purple-500" />
                            <span><strong>Ambulance:</strong> {handover.ambulanceId?.callSign || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setSelectedHandover(handover)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        Review Handover
                      </button>
                      {!handover.handover?.verified && (
                        <button
                          onClick={() => verifyHandover(handover._id)}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Verify Handover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Handover Summary */}
                {handover.handover && (
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Handover Summary</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <h4 className="font-semibold text-blue-800 mb-2">Paramedic Summary</h4>
                          <p className="text-blue-700">{handover.handover.paramedicSummary || "No summary provided"}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                          <h4 className="font-semibold text-green-800 mb-2">Treatment Summary</h4>
                          <p className="text-green-700">{handover.handover.treatmentSummary || "No treatment summary"}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <h4 className="font-semibold text-purple-800 mb-2">Condition on Arrival</h4>
                          <p className="text-purple-700">{handover.handover.patientConditionOnArrival || "Not documented"}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl">
                          <h4 className="font-semibold text-orange-800 mb-2">Handover Notes</h4>
                          <p className="text-orange-700">{handover.handover.handoverNotes || "No additional notes"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {handover.handover.verified && (
                      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Handover Verified</p>
                            <p className="text-green-700 text-sm">
                              Verified on {new Date(handover.handover.verifiedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Handover Detail Modal */}
        {selectedHandover && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Handover Details - {selectedHandover.incidentNumber}</h2>
                    <p className="text-blue-100">Patient: {selectedHandover.patientName || "Unknown"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedHandover(null)}
                    className="p-2 text-white hover:text-blue-200 transition-colors"
                  >
                    <AlertTriangle className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Medical Records */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Medical Records</h3>
                      
                      {/* Vital Signs */}
                      {selectedHandover.vitalSigns?.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-3">Vital Signs History</h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {selectedHandover.vitalSigns.slice(-3).map((vital, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-600">
                                    {new Date(vital.timestamp).toLocaleString()}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Record #{selectedHandover.vitalSigns.length - index}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>BP: {vital.bloodPressure || "N/A"}</div>
                                  <div>HR: {vital.heartRate || "N/A"}</div>
                                  <div>SpO2: {vital.oxygenSaturation || "N/A"}%</div>
                                  <div>Pain: {vital.painScale || 0}/10</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treatments */}
                      {selectedHandover.treatments?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">Treatments Administered</h4>
                          <div className="space-y-3">
                            {selectedHandover.treatments.map((treatment, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-900">{treatment.treatment}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(treatment.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                {treatment.medication && (
                                  <p className="text-sm text-gray-700">
                                    {treatment.medication} - {treatment.dosage} ({treatment.route})
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Handover Information */}
                  <div className="space-y-6">
                    {selectedHandover.handover && (
                      <div className="bg-blue-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Handover Information</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Paramedic Summary</h4>
                            <p className="text-blue-700 text-sm">{selectedHandover.handover.paramedicSummary}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Treatment Summary</h4>
                            <p className="text-blue-700 text-sm">{selectedHandover.handover.treatmentSummary}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Condition on Arrival</h4>
                            <p className="text-blue-700 text-sm">{selectedHandover.handover.patientConditionOnArrival}</p>
                          </div>
                          {selectedHandover.handover.handoverNotes && (
                            <div>
                              <h4 className="font-semibold text-blue-800 mb-2">Additional Notes</h4>
                              <p className="text-blue-700 text-sm">{selectedHandover.handover.handoverNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Verification Section */}
                    {!selectedHandover.handover?.verified && (
                      <div className="bg-green-50 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-green-900 mb-4">Verify Handover</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Verification Notes
                            </label>
                            <textarea
                              value={verificationNotes}
                              onChange={(e) => setVerificationNotes(e.target.value)}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                              rows="4"
                              placeholder="Add any notes about the handover verification..."
                            />
                          </div>
                          <button
                            onClick={() => verifyHandover(selectedHandover._id)}
                            disabled={verifying}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50"
                          >
                            {verifying ? (
                              <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying Handover...
                              </div>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 inline mr-2" />
                                Verify and Complete Handover
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ERHandoverVerification, ["er", "doctor", "nurse"]);