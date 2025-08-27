"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  Heart,
  Activity,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  FileText,
  Stethoscope,
  Calendar,
  User,
  Search,
  Plus,
  Eye,
  Download,
  Droplets,
  Zap,
  Brain
} from "lucide-react";

function ParamedicPatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/paramedic/patients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
      } else {
        setMessage("Error loading patients");
      }
    } catch (error) {
      setMessage("Error fetching patient data");
    } finally {
      setLoading(false);
    }
  };

  const getPatientStatus = (patient) => {
    if (patient.status === "Completed") return { status: "completed", color: "green", text: "Treatment Complete" };
    if (patient.status === "Transporting") return { status: "transporting", color: "blue", text: "En Route to Hospital" };
    if (patient.status === "On Scene") return { status: "active", color: "orange", text: "Active Treatment" };
    return { status: "pending", color: "yellow", text: "Pending Response" };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-700 border-red-200",
      High: "bg-orange-100 text-orange-700 border-orange-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Low: "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getLatestVitals = (patient) => {
    if (!patient.vitalSigns || patient.vitalSigns.length === 0) return null;
    return patient.vitalSigns[patient.vitalSigns.length - 1];
  };

  const getLatestTreatment = (patient) => {
    if (!patient.treatments || patient.treatments.length === 0) return null;
    return patient.treatments[patient.treatments.length - 1];
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "active") return ["On Scene", "Transporting"].includes(patient.status) && matchesSearch;
    if (filter === "critical") return patient.priority === "Critical" && matchesSearch;
    if (filter === "completed") return patient.status === "Completed" && matchesSearch;
    return matchesSearch;
  });

  const generatePatientReport = (patient) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Colors
    const colors = {
      primary: [220, 38, 38],     // Red
      secondary: [107, 114, 128], // Gray
      success: [34, 197, 94],     // Green
      warning: [245, 158, 11],    // Orange
      text: [31, 41, 55]          // Dark gray
    };

    // Header
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 60, "F");

    // Logo
    doc.setFillColor(255, 255, 255);
    doc.circle(30, 30, 15, "F");
    doc.setTextColor(...colors.primary);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EMS", 30, 35, { align: "center" });

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Care Report", 60, 25);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Incident: ${patient.incidentNumber}`, 60, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 60, 45);

    let yPosition = 80;

    // Patient Information
    doc.setTextColor(...colors.text);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, yPosition);
    yPosition += 15;

    const patientInfo = [
      ["Patient Name", patient.patientName || "Unknown"],
      ["Age", patient.patientAge ? `${patient.patientAge} years` : "Unknown"],
      ["Gender", patient.patientGender || "Unknown"],
      ["Emergency Type", patient.type || "Medical"],
      ["Priority Level", patient.priority || "Medium"],
      ["Chief Complaint", patient.chiefComplaint || "Not specified"],
      ["Patient Condition", patient.patientCondition || "Not documented"]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Information"]],
      body: patientInfo,
      theme: "grid",
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold"
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: 120 }
      },
      margin: { left: margin, right: margin }
    });

    yPosition = ((doc.lastAutoTable && doc.lastAutoTable.finalY) || yPosition) + 20;

    // Vital Signs
    if (patient.vitalSigns && patient.vitalSigns.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Vital Signs History", margin, yPosition);
      yPosition += 10;

      const vitalsData = patient.vitalSigns.map((vital) => [
        new Date(vital.timestamp).toLocaleTimeString(),
        vital.bloodPressure || "-",
        `${vital.heartRate || "-"} bpm`,
        `${vital.respiratoryRate || "-"} /min`,
        `${vital.temperature || "-"}°C`,
        `${vital.oxygenSaturation || "-"}%`,
        `${vital.painScale || 0}/10`,
        vital.consciousnessLevel || "-"
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Time", "BP", "HR", "RR", "Temp", "SpO2", "Pain", "LOC"]],
        body: vitalsData,
        theme: "striped",
        headStyles: {
          fillColor: colors.success,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold"
        },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin, right: margin }
      });

      yPosition = ((doc.lastAutoTable && doc.lastAutoTable.finalY) || yPosition) + 20;
    }

    // Treatments
    if (patient.treatments && patient.treatments.length > 0) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Treatments Administered", margin, yPosition);
      yPosition += 10;

      const treatmentData = patient.treatments.map((treatment) => [
        new Date(treatment.timestamp).toLocaleTimeString(),
        treatment.treatment || "-",
        treatment.medication || "-",
        treatment.dosage || "-",
        treatment.route || "-",
        treatment.response || "-"
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Time", "Treatment", "Medication", "Dosage", "Route", "Response"]],
        body: treatmentData,
        theme: "grid",
        headStyles: {
          fillColor: colors.warning,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold"
        },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin, right: margin }
      });

      yPosition = ((doc.lastAutoTable && doc.lastAutoTable.finalY) || yPosition) + 20;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

      doc.setTextColor(...colors.secondary);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Emergency Medical Services - Confidential Patient Report", margin, pageHeight - 15);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 15, { align: "right" });
    }

    doc.save(`Patient_Report_${patient.incidentNumber}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Patient Records</h1>
                <p className="text-gray-600 text-xl">Emergency patient care and treatment documentation</p>
              </div>
            </div>

            {/* Patient Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <div className="text-sm text-blue-600">Total Patients</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {patients.filter((p) => ["On Scene", "Transporting"].includes(p.status)).length}
                </div>
                <div className="text-sm text-orange-600">Active Cases</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.priority === "Critical").length}
                </div>
                <div className="text-sm text-red-600">Critical Cases</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "Completed").length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name, incident number, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: "All Patients", count: patients.length },
                {
                  key: "active",
                  label: "Active Cases",
                  count: patients.filter((p) => ["On Scene", "Transporting"].includes(p.status)).length
                },
                { key: "critical", label: "Critical", count: patients.filter((p) => p.priority === "Critical").length },
                { key: "completed", label: "Completed", count: patients.filter((p) => p.status === "Completed").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    filter === tab.key ? "bg-red-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Users className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Patients Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || filter !== "all" ? "No patients match your current filters." : "No patient records available."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredPatients.map((patient) => {
              const patientStatus = getPatientStatus(patient);
              const latestVitals = getLatestVitals(patient);
              const latestTreatment = getLatestTreatment(patient);

              return (
                <div
                  key={patient._id}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Patient Header */}
                  <div className="p-8 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                          {patient.patientName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">{patient.patientName || "Unknown Patient"}</h2>
                          <div className="flex items-center gap-4 mb-3">
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getPriorityColor(
                                patient.priority
                              )}`}
                            >
                              {patient.priority === "Critical" && <Heart className="w-4 h-4" />}
                              {patient.priority}
                            </span>
                            {/* Note: dynamic Tailwind classes like bg-${...} need safelisting in your config */}
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border">
                              {patientStatus.status === "completed" && <CheckCircle className="w-4 h-4" />}
                              {patientStatus.status === "active" && <Activity className="w-4 h-4" />}
                              {patientStatus.status === "transporting" && <Clock className="w-4 h-4" />}
                              {patientStatus.text}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span>
                                <strong>Incident:</strong> {patient.incidentNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span>
                                <strong>Time:</strong> {new Date(patient.reportedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-purple-500" />
                              <span>
                                <strong>Location:</strong> {patient.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowPatientModal(true);
                          }}
                          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                          View Details
                        </button>
                        <button
                          onClick={() => generatePatientReport(patient)}
                          className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          Download Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Patient Summary */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-8">
                      {/* Latest Vitals */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Latest Vitals
                        </h4>
                        {latestVitals ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-900">{latestVitals.bloodPressure || "N/A"}</div>
                                <div className="text-xs text-blue-600">Blood Pressure</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-900">{latestVitals.heartRate || "N/A"}</div>
                                <div className="text-xs text-blue-600">Heart Rate</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-900">{latestVitals.oxygenSaturation || "N/A"}%</div>
                                <div className="text-xs text-blue-600">SpO2</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-900">{latestVitals.painScale || 0}/10</div>
                                <div className="text-xs text-blue-600">Pain Scale</div>
                              </div>
                            </div>
                            <div className="text-xs text-blue-600 text-center">
                              Recorded: {new Date(latestVitals.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-blue-600">
                            <Stethoscope className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                            <p className="text-sm">No vitals recorded</p>
                          </div>
                        )}
                      </div>

                      {/* Latest Treatment */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                        <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          Latest Treatment
                        </h4>
                        {latestTreatment ? (
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-semibold text-green-900">{latestTreatment.treatment}</p>
                              {latestTreatment.medication && (
                                <p className="text-sm text-green-700">
                                  {latestTreatment.medication} - {latestTreatment.dosage}
                                </p>
                              )}
                              <p className="text-xs text-green-600">Route: {latestTreatment.route || "N/A"}</p>
                            </div>
                            <div className="text-xs text-green-600 text-center">
                              Administered: {new Date(latestTreatment.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-green-600">
                            <Heart className="w-12 h-12 text-green-300 mx-auto mb-2" />
                            <p className="text-sm">No treatments recorded</p>
                          </div>
                        )}
                      </div>

                      {/* Patient Condition */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                        <h4 className="font-bold text-purple-900 mb-4 text-lg flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Patient Info
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-purple-600 font-medium">Age</p>
                            <p className="text-purple-900">{patient.patientAge ? `${patient.patientAge} years` : "Unknown"}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-purple-600 font-medium">Gender</p>
                            <p className="text-purple-900">{patient.patientGender || "Unknown"}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-sm text-purple-600 font-medium">Condition</p>
                            <p className="text-purple-900 text-sm">{patient.patientCondition}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Patient Detail Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedPatient.patientName || "Unknown Patient"}</h2>
                    <p className="text-red-100">Incident: {selectedPatient.incidentNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPatientModal(false);
                      setSelectedPatient(null);
                    }}
                    className="p-2 text-white hover:text-red-200 transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Patient Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-600" />
                        Patient Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold">{selectedPatient.patientName || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-semibold">
                            {selectedPatient.patientAge ? `${selectedPatient.patientAge} years` : "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-semibold">{selectedPatient.patientGender || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              selectedPatient.priority === "Critical"
                                ? "bg-red-100 text-red-700"
                                : selectedPatient.priority === "High"
                                ? "bg-orange-100 text-orange-700"
                                : selectedPatient.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {selectedPatient.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">Medical Condition</h3>
                      <p className="text-red-800">{selectedPatient.patientCondition}</p>
                      {selectedPatient.chiefComplaint && (
                        <div className="mt-3">
                          <p className="text-red-700 font-medium">Chief Complaint:</p>
                          <p className="text-red-800">{selectedPatient.chiefComplaint}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-purple-900 mb-4">Location & Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-800">{selectedPatient.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-800">{selectedPatient.callerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-800">Caller: {selectedPatient.callerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Data */}
                  <div className="space-y-6">
                    {/* Vital Signs History */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Vital Signs ({selectedPatient.vitalSigns?.length || 0} records)
                      </h3>
                      {selectedPatient.vitalSigns && selectedPatient.vitalSigns.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedPatient.vitalSigns.slice(-3).map((vital, index) => (
                            <div key={index} className="bg-white rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-blue-600">
                                  {new Date(vital.timestamp).toLocaleString()}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Record #{selectedPatient.vitalSigns.length - index}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span>BP: {vital.bloodPressure || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-pink-500" />
                                  <span>HR: {vital.heartRate || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Droplets className="w-4 h-4 text-blue-500" />
                                  <span>SpO2: {vital.oxygenSaturation || "N/A"}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  <span>Pain: {vital.painScale || 0}/10</span>
                                </div>
                              </div>
                              {vital.consciousnessLevel && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm">LOC: {vital.consciousnessLevel}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-blue-600">
                          <Stethoscope className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                          <p className="text-sm">No vital signs recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Treatment History */}
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                      <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6" />
                        Treatments ({selectedPatient.treatments?.length || 0} records)
                      </h3>
                      {selectedPatient.treatments && selectedPatient.treatments.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedPatient.treatments.slice(-3).map((treatment, index) => (
                            <div key={index} className="bg-white rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-green-900">{treatment.treatment}</span>
                                <span className="text-xs text-green-600">
                                  {new Date(treatment.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              {treatment.medication && (
                                <div className="text-sm text-green-700 mb-2">
                                  <strong>Medication:</strong> {treatment.medication}
                                  {treatment.dosage && ` - ${treatment.dosage}`}
                                  {treatment.route && ` (${treatment.route})`}
                                </div>
                              )}
                              {treatment.response && (
                                <div className="text-sm text-green-600">
                                  <strong>Response:</strong> {treatment.response}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-green-600">
                          <Heart className="w-12 h-12 text-green-300 mx-auto mb-2" />
                          <p className="text-sm">No treatments recorded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 justify-center">
                  <button
                    onClick={() => generatePatientReport(selectedPatient)}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  >
                    <Download className="w-6 h-6" />
                    Download Patient Report
                  </button>
                  <button
                    onClick={() => (window.location.href = `/emergency/paramedic/${selectedPatient._id}`)}
                    className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
                  >
                    <Activity className="w-6 h-6" />
                    Open Emergency Interface
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ParamedicPatients, ["paramedic"]);
