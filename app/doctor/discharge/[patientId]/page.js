"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Activity,
  Heart,
  Pill,
  Calendar,
  Home,
  Plus,
  Trash2
} from "lucide-react";

function DischargePatientPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [dischargeData, setDischargeData] = useState({
    dischargeDate: new Date().toISOString().split('T')[0],
    dischargeTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    finalDiagnosis: "",
    secondaryDiagnoses: [],
    hospitalCourse: "",
    conditionAtDischarge: "Improved",
    vitalSignsAtDischarge: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: ""
    },
    dischargeMedications: [],
    dietaryInstructions: "",
    activityRestrictions: "",
    followUpCare: {
      required: false,
      appointmentDate: "",
      appointmentWith: "",
      instructions: ""
    },
    warningSignsToReport: [],
    patientEducation: "",
    caregiverInstructions: "",
    dischargeDestination: "Home",
    transportArrangements: "",
    clinicalNotes: "",
    additionalNotes: ""
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
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

  const addMedication = () => {
    setDischargeData({
      ...dischargeData,
      dischargeMedications: [
        ...dischargeData.dischargeMedications,
        { medicationName: "", dosage: "", frequency: "", duration: "", instructions: "" }
      ]
    });
  };

  const removeMedication = (index) => {
    setDischargeData({
      ...dischargeData,
      dischargeMedications: dischargeData.dischargeMedications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updatedMeds = [...dischargeData.dischargeMedications];
    updatedMeds[index][field] = value;
    setDischargeData({ ...dischargeData, dischargeMedications: updatedMeds });
  };

  const addWarningSign = () => {
    const sign = prompt("Enter warning sign to report:");
    if (sign) {
      setDischargeData({
        ...dischargeData,
        warningSignsToReport: [...dischargeData.warningSignsToReport, sign]
      });
    }
  };

  const removeWarningSign = (index) => {
    setDischargeData({
      ...dischargeData,
      warningSignsToReport: dischargeData.warningSignsToReport.filter((_, i) => i !== index)
    });
  };

  const addSecondaryDiagnosis = () => {
    const diagnosis = prompt("Enter secondary diagnosis:");
    if (diagnosis) {
      setDischargeData({
        ...dischargeData,
        secondaryDiagnoses: [...dischargeData.secondaryDiagnoses, diagnosis]
      });
    }
  };

  const removeSecondaryDiagnosis = (index) => {
    setDischargeData({
      ...dischargeData,
      secondaryDiagnoses: dischargeData.secondaryDiagnoses.filter((_, i) => i !== index)
    });
  };

  const handleDischarge = async () => {
    if (!confirm("Are you sure you want to discharge this patient? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...dischargeData
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Patient discharged successfully!");
        setTimeout(() => {
          router.push("/doctor/admitted-patients");
        }, 2000);
      } else {
        setMessage(data.error || "Error discharging patient");
      }
    } catch (error) {
      setMessage("Error discharging patient");
    } finally {
      setSubmitting(false);
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Discharge Patient</h1>
                <p className="text-gray-600 text-xl">
                  {patient.firstName} {patient.lastName} - {patient.admissionNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/doctor/admitted-patients")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">Chief Complaint</p>
              <p className="text-lg font-bold text-blue-900">{patient.chiefComplaint}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">Admission Date</p>
              <p className="text-lg font-bold text-green-900">
                {new Date(patient.admissionDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-600 font-semibold mb-1">Current Status</p>
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Discharge Date *</label>
              <input
                type="date"
                value={dischargeData.dischargeDate}
                onChange={(e) => setDischargeData({ ...dischargeData, dischargeDate: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Discharge Time</label>
              <input
                type="time"
                value={dischargeData.dischargeTime}
                onChange={(e) => setDischargeData({ ...dischargeData, dischargeTime: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Final Diagnosis *</label>
            <textarea
              value={dischargeData.finalDiagnosis}
              onChange={(e) => setDischargeData({ ...dischargeData, finalDiagnosis: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Enter the final diagnosis..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Secondary Diagnoses</label>
              <button
                onClick={addSecondaryDiagnosis}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {dischargeData.secondaryDiagnoses.length > 0 && (
              <div className="space-y-2">
                {dischargeData.secondaryDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <span className="flex-1 text-gray-700">{diagnosis}</span>
                    <button
                      onClick={() => removeSecondaryDiagnosis(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hospital Course *</label>
            <textarea
              value={dischargeData.hospitalCourse}
              onChange={(e) => setDischargeData({ ...dischargeData, hospitalCourse: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="5"
              placeholder="Describe the patient's hospital course, including treatments, responses, and significant events..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Condition at Discharge *</label>
            <select
              value={dischargeData.conditionAtDischarge}
              onChange={(e) => setDischargeData({ ...dischargeData, conditionAtDischarge: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Improved">Improved</option>
              <option value="Stable">Stable</option>
              <option value="Unchanged">Unchanged</option>
              <option value="Deteriorated">Deteriorated</option>
            </select>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Vital Signs at Discharge
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Pressure</label>
                <input
                  type="text"
                  value={dischargeData.vitalSignsAtDischarge.bloodPressure}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    vitalSignsAtDischarge: { ...dischargeData.vitalSignsAtDischarge, bloodPressure: e.target.value }
                  })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate</label>
                <input
                  type="text"
                  value={dischargeData.vitalSignsAtDischarge.heartRate}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    vitalSignsAtDischarge: { ...dischargeData.vitalSignsAtDischarge, heartRate: e.target.value }
                  })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="72 bpm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature</label>
                <input
                  type="text"
                  value={dischargeData.vitalSignsAtDischarge.temperature}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    vitalSignsAtDischarge: { ...dischargeData.vitalSignsAtDischarge, temperature: e.target.value }
                  })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98.6°F"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Discharge Medications
              </h3>
              <button
                onClick={addMedication}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Medication
              </button>
            </div>

            {dischargeData.dischargeMedications.length > 0 ? (
              <div className="space-y-4">
                {dischargeData.dischargeMedications.map((med, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900">Medication {index + 1}</h4>
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Medication Name *</label>
                        <input
                          type="text"
                          value={med.medicationName}
                          onChange={(e) => updateMedication(index, "medicationName", e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter medication name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Twice daily"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, "duration", e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                      <textarea
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="2"
                        placeholder="Special instructions..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No discharge medications added</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Instructions</label>
              <textarea
                value={dischargeData.dietaryInstructions}
                onChange={(e) => setDischargeData({ ...dischargeData, dietaryInstructions: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Dietary guidelines and restrictions..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Activity Restrictions</label>
              <textarea
                value={dischargeData.activityRestrictions}
                onChange={(e) => setDischargeData({ ...dischargeData, activityRestrictions: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Physical activity restrictions..."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Follow-Up Care
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={dischargeData.followUpCare.required}
                  onChange={(e) => setDischargeData({
                    ...dischargeData,
                    followUpCare: { ...dischargeData.followUpCare, required: e.target.checked }
                  })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-bold text-gray-700">Follow-up appointment required</label>
              </div>

              {dischargeData.followUpCare.required && (
                <div className="grid md:grid-cols-2 gap-4 pl-9">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                    <input
                      type="date"
                      value={dischargeData.followUpCare.appointmentDate}
                      onChange={(e) => setDischargeData({
                        ...dischargeData,
                        followUpCare: { ...dischargeData.followUpCare, appointmentDate: e.target.value }
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment With</label>
                    <input
                      type="text"
                      value={dischargeData.followUpCare.appointmentWith}
                      onChange={(e) => setDischargeData({
                        ...dischargeData,
                        followUpCare: { ...dischargeData.followUpCare, appointmentWith: e.target.value }
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Doctor or specialist name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={dischargeData.followUpCare.instructions}
                      onChange={(e) => setDischargeData({
                        ...dischargeData,
                        followUpCare: { ...dischargeData.followUpCare, instructions: e.target.value }
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="2"
                      placeholder="Follow-up instructions..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Warning Signs to Report</label>
              <button
                onClick={addWarningSign}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            {dischargeData.warningSignsToReport.length > 0 && (
              <div className="space-y-2">
                {dischargeData.warningSignsToReport.map((sign, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="flex-1 text-red-800">{sign}</span>
                    <button
                      onClick={() => removeWarningSign(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Patient Education</label>
              <textarea
                value={dischargeData.patientEducation}
                onChange={(e) => setDischargeData({ ...dischargeData, patientEducation: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                placeholder="Information provided to the patient..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Caregiver Instructions</label>
              <textarea
                value={dischargeData.caregiverInstructions}
                onChange={(e) => setDischargeData({ ...dischargeData, caregiverInstructions: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                placeholder="Instructions for caregivers..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Discharge Destination</label>
              <select
                value={dischargeData.dischargeDestination}
                onChange={(e) => setDischargeData({ ...dischargeData, dischargeDestination: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Home">Home</option>
                <option value="Rehabilitation Facility">Rehabilitation Facility</option>
                <option value="Nursing Home">Nursing Home</option>
                <option value="Another Hospital">Another Hospital</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transport Arrangements</label>
              <input
                type="text"
                value={dischargeData.transportArrangements}
                onChange={(e) => setDischargeData({ ...dischargeData, transportArrangements: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Family pickup, Ambulance"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Clinical Notes</label>
            <textarea
              value={dischargeData.clinicalNotes}
              onChange={(e) => setDischargeData({ ...dischargeData, clinicalNotes: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              placeholder="Additional clinical notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={dischargeData.additionalNotes}
              onChange={(e) => setDischargeData({ ...dischargeData, additionalNotes: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Any other relevant information..."
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleDischarge}
              disabled={submitting || !dischargeData.finalDiagnosis || !dischargeData.hospitalCourse}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Discharging Patient...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Discharge Patient
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DischargePatientPage, ["doctor"]);
