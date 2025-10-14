"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Pill,
  Calendar,
  Plus,
  Save,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  User,
  FileText
} from "lucide-react";

function PatientCarePage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("medications");
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [newMedication, setNewMedication] = useState({
    medicationName: "",
    dosage: "",
    route: "Oral",
    frequency: "",
    duration: "",
    startDate: "",
    endDate: "",
    instructions: "",
    indication: "",
    notes: ""
  });

  const [newProcedure, setNewProcedure] = useState({
    procedureName: "",
    procedureType: "Diagnostic",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    estimatedDuration: "",
    priority: "Routine",
    location: "",
    room: "",
    preOpInstructions: "",
    postOpInstructions: "",
    requiredPreparation: "",
    notes: ""
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchMedications();
      fetchProcedures();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/admission/resources?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok && data.patients?.length > 0) {
        setPatient(data.patients[0]);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await fetch(`/api/medications?patientAdmissionId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  const fetchProcedures = async () => {
    try {
      const res = await fetch(`/api/procedures?patientAdmissionId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setProcedures(data.procedures || []);
      }
    } catch (error) {
      console.error("Error fetching procedures:", error);
    }
  };

  const handlePrescribeMedication = async () => {
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...newMedication
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Medication prescribed successfully!");
        setShowMedicationModal(false);
        fetchMedications();
        setNewMedication({
          medicationName: "",
          dosage: "",
          route: "Oral",
          frequency: "",
          duration: "",
          startDate: "",
          endDate: "",
          instructions: "",
          indication: "",
          notes: ""
        });
      } else {
        setMessage(data.error || "Error prescribing medication");
      }
    } catch (error) {
      setMessage("Error prescribing medication");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleProcedure = async () => {
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...newProcedure
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Procedure scheduled successfully!");
        setShowProcedureModal(false);
        fetchProcedures();
        setNewProcedure({
          procedureName: "",
          procedureType: "Diagnostic",
          description: "",
          scheduledDate: "",
          scheduledTime: "",
          estimatedDuration: "",
          priority: "Routine",
          location: "",
          room: "",
          preOpInstructions: "",
          postOpInstructions: "",
          requiredPreparation: "",
          notes: ""
        });
      } else {
        setMessage(data.error || "Error scheduling procedure");
      }
    } catch (error) {
      setMessage("Error scheduling procedure");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Active": "bg-green-100 text-green-700",
      "Completed": "bg-blue-100 text-blue-700",
      "Discontinued": "bg-gray-100 text-gray-700",
      "On Hold": "bg-yellow-100 text-yellow-700",
      "Scheduled": "bg-blue-100 text-blue-700",
      "Confirmed": "bg-green-100 text-green-700",
      "In Progress": "bg-orange-100 text-orange-700",
      "Cancelled": "bg-red-100 text-red-700",
      "Postponed": "bg-yellow-100 text-yellow-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Routine": "bg-blue-100 text-blue-700",
      "Urgent": "bg-orange-100 text-orange-700",
      "Emergency": "bg-red-100 text-red-700",
      "STAT": "bg-red-200 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient care information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <button
            onClick={() => router.push("/doctor/admitted-patients")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">Patient Care</h1>
                <p className="text-gray-600 text-xl mt-2">{patient.firstName} {patient.lastName}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/doctor/admitted-patients")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Admission Number</p>
              <p className="text-lg font-bold text-blue-900">{patient.admissionNumber}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">Chief Complaint</p>
              <p className="text-lg font-bold text-green-900">{patient.chiefComplaint}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-600 font-semibold mb-1">Status</p>
              <p className="text-lg font-bold text-orange-900">{patient.status}</p>
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
              <AlertCircle className="w-6 h-6" />
            )}
            <p className="font-semibold text-lg">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-colors ${
                activeTab === "medications"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Pill className="w-5 h-5" />
                Medications ({medications.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("procedures")}
              className={`flex-1 px-6 py-4 font-semibold text-lg transition-colors ${
                activeTab === "procedures"
                  ? "bg-green-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Procedures ({procedures.length})
              </div>
            </button>
          </div>

          <div className="p-8">
            {activeTab === "medications" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Medications</h2>
                  <button
                    onClick={() => setShowMedicationModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Prescribe Medication
                  </button>
                </div>

                {medications.length > 0 ? (
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div key={med._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{med.medicationName}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(med.status)}`}>
                                {med.status}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {med.route}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Dosage</p>
                            <p className="font-semibold text-gray-900">{med.dosage}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Frequency</p>
                            <p className="font-semibold text-gray-900">{med.frequency}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Duration</p>
                            <p className="font-semibold text-gray-900">{med.duration || "Ongoing"}</p>
                          </div>
                        </div>

                        {med.instructions && (
                          <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-blue-700 mb-1">Instructions</p>
                            <p className="text-sm text-blue-900">{med.instructions}</p>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          Prescribed by: {med.prescribedBy?.title ? `${med.prescribedBy.title}. ` : ""}{med.prescribedBy?.name} on {new Date(med.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Pill className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No medications prescribed yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "procedures" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Procedures</h2>
                  <button
                    onClick={() => setShowProcedureModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Schedule Procedure
                  </button>
                </div>

                {procedures.length > 0 ? (
                  <div className="space-y-4">
                    {procedures.map((proc) => (
                      <div key={proc._id} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{proc.procedureName}</h3>
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proc.status)}`}>
                                {proc.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(proc.priority)}`}>
                                {proc.priority}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {proc.procedureType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Scheduled Date</p>
                            <p className="font-semibold text-gray-900">{new Date(proc.scheduledDate).toLocaleDateString()}</p>
                          </div>
                          {proc.scheduledTime && (
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-600 mb-1">Time</p>
                              <p className="font-semibold text-gray-900">{proc.scheduledTime}</p>
                            </div>
                          )}
                          {proc.location && (
                            <div className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-600 mb-1">Location</p>
                              <p className="font-semibold text-gray-900">{proc.location}</p>
                            </div>
                          )}
                        </div>

                        {proc.description && (
                          <div className="bg-green-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-green-700 mb-1">Description</p>
                            <p className="text-sm text-green-900">{proc.description}</p>
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          Scheduled by: {proc.scheduledBy?.title ? `${proc.scheduledBy.title}. ` : ""}{proc.scheduledBy?.name} on {new Date(proc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No procedures scheduled yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMedicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Prescribe Medication</h3>
                <button
                  onClick={() => setShowMedicationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medication Name *</label>
                <input
                  type="text"
                  value={newMedication.medicationName}
                  onChange={(e) => setNewMedication({ ...newMedication, medicationName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medication name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Route *</label>
                  <select
                    value={newMedication.route}
                    onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="SC">SC</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Rectal">Rectal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
                  <input
                    type="text"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Twice daily"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={newMedication.duration}
                    onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Indication</label>
                <input
                  type="text"
                  value={newMedication.indication}
                  onChange={(e) => setNewMedication({ ...newMedication, indication: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for prescription"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  placeholder="Special instructions for the patient..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>

              <button
                onClick={handlePrescribeMedication}
                disabled={submitting || !newMedication.medicationName || !newMedication.dosage || !newMedication.frequency}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Prescribing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Prescribe Medication
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProcedureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Schedule Procedure</h3>
                <button
                  onClick={() => setShowProcedureModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Procedure Name *</label>
                <input
                  type="text"
                  value={newProcedure.procedureName}
                  onChange={(e) => setNewProcedure({ ...newProcedure, procedureName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter procedure name"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Procedure Type *</label>
                  <select
                    value={newProcedure.procedureType}
                    onChange={(e) => setNewProcedure({ ...newProcedure, procedureType: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Surgery">Surgery</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Therapeutic">Therapeutic</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Biopsy">Biopsy</option>
                    <option value="Endoscopy">Endoscopy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={newProcedure.priority}
                    onChange={(e) => setNewProcedure({ ...newProcedure, priority: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                    <option value="STAT">STAT</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    value={newProcedure.scheduledDate}
                    onChange={(e) => setNewProcedure({ ...newProcedure, scheduledDate: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newProcedure.scheduledTime}
                    onChange={(e) => setNewProcedure({ ...newProcedure, scheduledTime: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newProcedure.location}
                    onChange={(e) => setNewProcedure({ ...newProcedure, location: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Operating Room 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Duration</label>
                  <input
                    type="text"
                    value={newProcedure.estimatedDuration}
                    onChange={(e) => setNewProcedure({ ...newProcedure, estimatedDuration: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProcedure.description}
                  onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows="3"
                  placeholder="Procedure description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pre-Op Instructions</label>
                <textarea
                  value={newProcedure.preOpInstructions}
                  onChange={(e) => setNewProcedure({ ...newProcedure, preOpInstructions: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows="2"
                  placeholder="Instructions before the procedure..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post-Op Instructions</label>
                <textarea
                  value={newProcedure.postOpInstructions}
                  onChange={(e) => setNewProcedure({ ...newProcedure, postOpInstructions: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows="2"
                  placeholder="Instructions after the procedure..."
                />
              </div>

              <button
                onClick={handleScheduleProcedure}
                disabled={submitting || !newProcedure.procedureName || !newProcedure.scheduledDate}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Schedule Procedure
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(PatientCarePage, ["doctor", "nurse"]);
