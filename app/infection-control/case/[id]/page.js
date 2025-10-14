"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Shield,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Plus,
  Save,
  X,
  CheckCircle
} from "lucide-react";

function InfectionControlCaseDetail({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();

  const [infectionCase, setInfectionCase] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showWardModal, setShowWardModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedWard, setSelectedWard] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [newProtocol, setNewProtocol] = useState({
    protocolName: "",
    description: ""
  });

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
      fetchWards();
    }
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const res = await fetch(`/api/infection-control/${id}`);
      const data = await res.json();
      if (res.ok) {
        setInfectionCase(data.infectionControl);
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const res = await fetch("/api/wards");
      const data = await res.json();
      if (res.ok) {
        setWards(data.wards || []);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleAssignWard = async () => {
    if (!selectedWard) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/infection-control/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedWard: selectedWard,
          assignedRoom: selectedRoom
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Ward assigned successfully!");
        setShowWardModal(false);
        fetchCaseDetails();
      } else {
        setMessage(data.error || "Error assigning ward");
      }
    } catch (error) {
      setMessage("Error assigning ward");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProtocol = async () => {
    if (!newProtocol.protocolName) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/infection-control/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addProtocol: newProtocol
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Protocol added successfully!");
        setShowProtocolModal(false);
        setNewProtocol({ protocolName: "", description: "" });
        fetchCaseDetails();
      } else {
        setMessage(data.error || "Error adding protocol");
      }
    } catch (error) {
      setMessage("Error adding protocol");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveCase = async () => {
    if (!confirm("Are you sure you want to mark this case as resolved?")) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`/api/infection-control/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Resolved",
          resolutionNotes: "Case resolved by staff"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Case marked as resolved!");
        fetchCaseDetails();
      } else {
        setMessage(data.error || "Error resolving case");
      }
    } catch (error) {
      setMessage("Error resolving case");
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      "Critical": "bg-red-600 text-white",
      "High": "bg-orange-500 text-white",
      "Medium": "bg-yellow-500 text-white",
      "Low": "bg-green-500 text-white"
    };
    return colors[risk] || "bg-gray-500 text-white";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Active": "bg-red-100 text-red-700",
      "Monitoring": "bg-yellow-100 text-yellow-700",
      "Resolved": "bg-green-100 text-green-700",
      "Transferred": "bg-blue-100 text-blue-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!infectionCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Case Not Found</h2>
          <button
            onClick={() => router.push("/infection-control/dashboard")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {infectionCase.patientAdmissionId?.firstName} {infectionCase.patientAdmissionId?.lastName}
                </h1>
                <p className="text-gray-600 text-xl">
                  Admission: {infectionCase.patientAdmissionId?.admissionNumber}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/infection-control/dashboard")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              {infectionCase.status === "Active" && (
                <button
                  onClick={handleResolveCase}
                  disabled={submitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-sm text-red-600 font-semibold mb-1">Risk Level</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(infectionCase.riskLevel)}`}>
                {infectionCase.riskLevel}
              </span>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-600 font-semibold mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(infectionCase.status)}`}>
                {infectionCase.status}
              </span>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Isolation Type</p>
              <p className="text-lg font-bold text-blue-900">{infectionCase.isolationType}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">Identified</p>
              <p className="text-sm font-bold text-green-900">
                {new Date(infectionCase.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully")
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg flex items-center gap-4`}>
            {message.includes("successfully") ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
            <p className="font-semibold text-lg">{message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Activity className="w-6 h-6 text-red-600" />
              Infection Details
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600 font-semibold mb-1">Infection Type</p>
                <p className="text-lg font-bold text-red-900">{infectionCase.infectionType}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-orange-600 font-semibold mb-1">Category</p>
                <p className="text-lg font-bold text-orange-900">{infectionCase.infectionCategory}</p>
              </div>
              {infectionCase.symptoms && infectionCase.symptoms.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-700 font-semibold mb-2">Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {infectionCase.symptoms.map((symptom, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                Ward Assignment
              </h2>
              <button
                onClick={() => setShowWardModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Assign Ward
              </button>
            </div>

            {infectionCase.assignedWard ? (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">Assigned Ward</p>
                <p className="text-lg font-bold text-green-900">{infectionCase.assignedWard.name}</p>
                {infectionCase.assignedRoom && (
                  <p className="text-sm text-green-700 mt-1">Room: {infectionCase.assignedRoom}</p>
                )}
                <p className="text-xs text-green-600 mt-2">
                  Assigned on {new Date(infectionCase.wardAssignedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-6 bg-orange-50 rounded-xl border border-orange-200 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <p className="text-orange-700 font-semibold">No ward assigned yet</p>
                {infectionCase.specialWardRequired && (
                  <p className="text-sm text-orange-600 mt-2">Special ward required</p>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              {infectionCase.isolationRequired && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-700">Isolation Required</span>
                </div>
              )}
              {infectionCase.specialWardRequired && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700">Special Ward Required</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              Infection Control Protocols
            </h2>
            <button
              onClick={() => setShowProtocolModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Protocol
            </button>
          </div>

          {infectionCase.protocols && infectionCase.protocols.length > 0 ? (
            <div className="space-y-3">
              {infectionCase.protocols.map((protocol, idx) => (
                <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{protocol.protocolName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      protocol.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {protocol.status}
                    </span>
                  </div>
                  {protocol.description && (
                    <p className="text-sm text-gray-600 mb-2">{protocol.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Implemented on {new Date(protocol.implementedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No protocols added yet</p>
            </div>
          )}
        </div>

        {infectionCase.alerts && infectionCase.alerts.length > 0 && (
          <div className="bg-red-50 rounded-2xl shadow-lg border-2 border-red-200 p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Alerts
            </h2>
            <div className="space-y-2">
              {infectionCase.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showWardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Assign Ward</h3>
                <button
                  onClick={() => setShowWardModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Ward *</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a ward</option>
                  {wards.map((ward) => (
                    <option key={ward._id} value={ward._id}>
                      {ward.name} ({ward.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room number"
                />
              </div>

              <button
                onClick={handleAssignWard}
                disabled={submitting || !selectedWard}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Assigning..." : "Assign Ward"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProtocolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Add Protocol</h3>
                <button
                  onClick={() => setShowProtocolModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Protocol Name *</label>
                <input
                  type="text"
                  value={newProtocol.protocolName}
                  onChange={(e) => setNewProtocol({ ...newProtocol, protocolName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Hand Hygiene Protocol"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProtocol.description}
                  onChange={(e) => setNewProtocol({ ...newProtocol, description: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows="3"
                  placeholder="Protocol details..."
                />
              </div>

              <button
                onClick={handleAddProtocol}
                disabled={submitting || !newProtocol.protocolName}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Protocol"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(InfectionControlCaseDetail, ["doctor", "nurse", "ward_manager", "admin"]);
