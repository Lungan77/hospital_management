"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import { Stethoscope, User, Calendar, Clock, AlertTriangle, Activity, FileText, Save } from "lucide-react";

function RecordDiagnosis() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [formData, setFormData] = useState({
    symptoms: "",
    symptomsDuration: "",
    diagnosis: "",
    severity: "Mild",
    labTestsOrdered: "",
    notes: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitDiagnosis = async () => {
    if (!selectedAppointment || !formData.symptoms || !formData.diagnosis || !formData.severity) {
      setMessage("Please fill in all required fields, including severity.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        appointmentId: selectedAppointment, 
        ...formData 
      }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
    
    if (res.ok) {
      // Reset form
      setSelectedAppointment("");
      setFormData({
        symptoms: "",
        symptomsDuration: "",
        diagnosis: "",
        severity: "Mild",
        labTestsOrdered: "",
        notes: ""
      });
    }
  };

  const selectedAppointmentData = appointments.find(appt => appt._id === selectedAppointment);

  const getSeverityColor = (severity) => {
    const colors = {
      Mild: "bg-green-100 text-green-700 border-green-200",
      Moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Severe: "bg-red-100 text-red-700 border-red-200"
    };
    return colors[severity] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Record Diagnosis</h1>
            <p className="text-gray-600 text-xl">Document patient diagnosis and medical assessment</p>
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

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Patient Selection */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-8 h-8 text-emerald-600" />
              Select Patient Appointment
            </h2>
            <select 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-lg"
              onChange={(e) => setSelectedAppointment(e.target.value)}
              value={selectedAppointment}
            >
              <option value="">-- Choose an appointment --</option>
              {appointments
                .filter((appt) => appt.checkedIn && appt.doctorId === session?.user._id)
                .map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {appt.patientName} - {appt.timeSlot} with Dr. {appt.doctorName}
                  </option>
                ))}
            </select>

            {selectedAppointmentData && (
              <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-emerald-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedAppointmentData.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAppointmentData.patientName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedAppointmentData.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedAppointmentData.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diagnosis Form */}
          {selectedAppointmentData && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Medical Assessment
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Symptoms Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Patient Symptoms *
                    </label>
                    <textarea
                      placeholder="Describe the patient's symptoms in detail..."
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange('symptoms', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Symptoms Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 3 days, 2 weeks, 1 month"
                      value={formData.symptomsDuration}
                      onChange={(e) => handleInputChange('symptomsDuration', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Lab Tests Ordered
                    </label>
                    <textarea
                      placeholder="List any laboratory tests ordered..."
                      value={formData.labTestsOrdered}
                      onChange={(e) => handleInputChange('labTestsOrdered', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Diagnosis Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Medical Diagnosis *
                    </label>
                    <textarea
                      placeholder="Enter the medical diagnosis..."
                      value={formData.diagnosis}
                      onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Severity Level *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Mild", "Moderate", "Severe"].map((severity) => (
                        <button
                          key={severity}
                          type="button"
                          onClick={() => handleInputChange('severity', severity)}
                          className={`p-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                            formData.severity === severity
                              ? getSeverityColor(severity) + " shadow-lg transform scale-105"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {severity === "Mild" && <Activity className="w-5 h-5 mx-auto mb-1" />}
                          {severity === "Moderate" && <Clock className="w-5 h-5 mx-auto mb-1" />}
                          {severity === "Severe" && <AlertTriangle className="w-5 h-5 mx-auto mb-1" />}
                          {severity}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Any additional observations or notes..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              {formData.diagnosis && (
                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200">
                  <h3 className="font-bold text-emerald-900 mb-4 text-lg">Diagnosis Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-emerald-700"><strong>Patient:</strong> {selectedAppointmentData.patientName}</p>
                      <p className="text-emerald-700"><strong>Diagnosis:</strong> {formData.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700"><strong>Severity:</strong> {formData.severity}</p>
                      <p className="text-emerald-700"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={submitDiagnosis}
                disabled={loading || !formData.symptoms || !formData.diagnosis}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 shadow-xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Diagnosis...
                  </div>
                ) : (
                  <>
                    <Save className="w-6 h-6 inline mr-3" />
                    Save Diagnosis
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(RecordDiagnosis, ["doctor"]);