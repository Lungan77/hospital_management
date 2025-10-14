"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  User,
  Heart,
  Pill,
  Stethoscope,
  ClipboardList,
  Users,
  Activity,
  Calendar,
  Plus,
  Trash2,
  Save,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";

function TreatmentPlanPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [treatmentPlan, setTreatmentPlan] = useState({
    treatmentGoals: "",
    medications: [],
    procedures: [],
    diagnosticTests: [],
    consultations: [],
    nursingCare: [],
    dietaryRequirements: {
      type: "",
      restrictions: "",
      allergies: "",
      specialInstructions: ""
    },
    activityRestrictions: "",
    monitoringRequirements: [],
    expectedDuration: "",
    staffTasks: [],
    notes: ""
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchExistingPlans();
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

  const fetchExistingPlans = async () => {
    try {
      const res = await fetch(`/api/doctor/treatment-plans?patientAdmissionId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setExistingPlans(data.treatmentPlans || []);
      }
    } catch (error) {
      console.error("Error fetching treatment plans:", error);
    }
  };

  const addMedication = () => {
    setTreatmentPlan({
      ...treatmentPlan,
      medications: [...treatmentPlan.medications, { name: "", dosage: "", frequency: "", route: "", duration: "", instructions: "" }]
    });
  };

  const removeMedication = (index) => {
    setTreatmentPlan({
      ...treatmentPlan,
      medications: treatmentPlan.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updated = [...treatmentPlan.medications];
    updated[index][field] = value;
    setTreatmentPlan({ ...treatmentPlan, medications: updated });
  };

  const addStaffTask = () => {
    setTreatmentPlan({
      ...treatmentPlan,
      staffTasks: [...treatmentPlan.staffTasks, { task: "", priority: "Medium", assignedTo: "", dueDate: "", notes: "" }]
    });
  };

  const removeStaffTask = (index) => {
    setTreatmentPlan({
      ...treatmentPlan,
      staffTasks: treatmentPlan.staffTasks.filter((_, i) => i !== index)
    });
  };

  const updateStaffTask = (index, field, value) => {
    const updated = [...treatmentPlan.staffTasks];
    updated[index][field] = value;
    setTreatmentPlan({ ...treatmentPlan, staffTasks: updated });
  };

  const addNursingTask = () => {
    setTreatmentPlan({
      ...treatmentPlan,
      nursingCare: [...treatmentPlan.nursingCare, { task: "", frequency: "", priority: "Medium", assignedNurse: "" }]
    });
  };

  const removeNursingTask = (index) => {
    setTreatmentPlan({
      ...treatmentPlan,
      nursingCare: treatmentPlan.nursingCare.filter((_, i) => i !== index)
    });
  };

  const updateNursingTask = (index, field, value) => {
    const updated = [...treatmentPlan.nursingCare];
    updated[index][field] = value;
    setTreatmentPlan({ ...treatmentPlan, nursingCare: updated });
  };

  const saveTreatmentPlan = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/doctor/treatment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...treatmentPlan
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Treatment plan saved successfully!");
        fetchExistingPlans();
        setTimeout(() => router.push("/doctor/admitted-patients"), 2000);
      } else {
        setMessage(data.error || "Error saving treatment plan");
      }
    } catch (error) {
      setMessage("Error saving treatment plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient information...</p>
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
          <p className="text-gray-600 mb-6">Unable to load patient information</p>
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
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">Treatment Plan</h1>
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

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Create Treatment Plan</h2>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Treatment Goals</label>
              <textarea
                value={treatmentPlan.treatmentGoals}
                onChange={(e) => setTreatmentPlan({ ...treatmentPlan, treatmentGoals: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Define the primary goals of treatment..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">Medications</label>
                <button
                  onClick={addMedication}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>
              <div className="space-y-4">
                {treatmentPlan.medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        placeholder="Medication name"
                        value={med.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g., twice daily)"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Route (e.g., oral)"
                        value={med.route}
                        onChange={(e) => updateMedication(index, "route", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      placeholder="Special instructions..."
                      value={med.instructions}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="2"
                    />
                    <button
                      onClick={() => removeMedication(index)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">Nursing Care Tasks</label>
                <button
                  onClick={addNursingTask}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Nursing Task
                </button>
              </div>
              <div className="space-y-4">
                {treatmentPlan.nursingCare.map((task, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      <input
                        type="text"
                        placeholder="Task description"
                        value={task.task}
                        onChange={(e) => updateNursingTask(index, "task", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g., every 4 hours)"
                        value={task.frequency}
                        onChange={(e) => updateNursingTask(index, "frequency", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <select
                        value={task.priority}
                        onChange={(e) => updateNursingTask(index, "priority", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Priority</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeNursingTask(index)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">Staff Tasks</label>
                <button
                  onClick={addStaffTask}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff Task
                </button>
              </div>
              <div className="space-y-4">
                {treatmentPlan.staffTasks.map((task, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        placeholder="Task description"
                        value={task.task}
                        onChange={(e) => updateStaffTask(index, "task", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={task.priority}
                        onChange={(e) => updateStaffTask(index, "priority", e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical Priority</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Notes..."
                      value={task.notes}
                      onChange={(e) => updateStaffTask(index, "notes", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows="2"
                    />
                    <button
                      onClick={() => removeStaffTask(index)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Restrictions</label>
              <textarea
                value={treatmentPlan.activityRestrictions}
                onChange={(e) => setTreatmentPlan({ ...treatmentPlan, activityRestrictions: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Specify any activity restrictions..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Notes</label>
              <textarea
                value={treatmentPlan.notes}
                onChange={(e) => setTreatmentPlan({ ...treatmentPlan, notes: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Any additional notes or observations..."
              />
            </div>

            <button
              onClick={saveTreatmentPlan}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-xl hover:shadow-blue-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Treatment Plan...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Treatment Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(TreatmentPlanPage, ["doctor"]);
