"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { HeartPulse, Thermometer, Activity, Wind, Droplets, Weight, Ruler, Calculator, User, Clock, CheckCircle, AlertCircle, Stethoscope } from "lucide-react";

function RecordVitals() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
  };

  const handleAppointmentSelection = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointmentData(appointment);
  };

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = () => {
    if (vitals.weight && vitals.height) {
      const weightKg = parseFloat(vitals.weight);
      const heightM = parseFloat(vitals.height) / 100;
      if (weightKg > 0 && heightM > 0) {
        return (weightKg / (heightM * heightM)).toFixed(1);
      }
    }
    return "";
  };

  const submitVitals = async () => {
    if (!selectedAppointmentData?.checkedIn) {
      setMessage("Patient must be checked in before recording vitals.");
      return;
    }

    const requiredFields = Object.values(vitals);
    if (requiredFields.some(field => !field)) {
      setMessage("Please fill in all vital signs.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: selectedAppointment, ...vitals }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
    
    if (res.ok) {
      // Reset form
      setVitals({
        bloodPressure: "",
        temperature: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
        height: ""
      });
      setSelectedAppointment("");
      setSelectedAppointmentData(null);
    }
  };

  const vitalInputs = [
    { key: "bloodPressure", label: "Blood Pressure", icon: <HeartPulse className="w-5 h-5" />, unit: "mmHg", placeholder: "120/80", color: "red" },
    { key: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", placeholder: "36.5", color: "orange" },
    { key: "heartRate", label: "Heart Rate", icon: <Activity className="w-5 h-5" />, unit: "bpm", placeholder: "72", color: "pink" },
    { key: "respiratoryRate", label: "Respiratory Rate", icon: <Wind className="w-5 h-5" />, unit: "/min", placeholder: "16", color: "blue" },
    { key: "oxygenSaturation", label: "Oxygen Saturation", icon: <Droplets className="w-5 h-5" />, unit: "%", placeholder: "98", color: "cyan" },
    { key: "weight", label: "Weight", icon: <Weight className="w-5 h-5" />, unit: "kg", placeholder: "70", color: "green" },
    { key: "height", label: "Height", icon: <Ruler className="w-5 h-5" />, unit: "cm", placeholder: "170", color: "purple" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-100 to-red-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <HeartPulse className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Record Vital Signs</h1>
            <p className="text-gray-600 text-xl">Monitor and record patient vital signs with precision</p>
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
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-8 h-8 text-pink-600" />
              Select Patient
            </h2>
            <select 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white text-lg"
              onChange={(e) => handleAppointmentSelection(e.target.value)}
              value={selectedAppointment}
            >
              <option value="">-- Choose an appointment --</option>
              {appointments.map((appt) => (
                <option key={appt._id} value={appt._id}>
                  {appt.patientName} - {appt.timeSlot} with Dr. {appt.doctorName} 
                  {appt.checkedIn ? " ✓ Checked In" : " ⏳ Not Checked In"}
                </option>
              ))}
            </select>

            {selectedAppointmentData && (
              <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-pink-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {selectedAppointmentData.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAppointmentData.patientName}</h3>
                    <p className="text-gray-600">Dr. {selectedAppointmentData.doctorName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedAppointmentData.checkedIn ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 font-medium">Checked In</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <span className="text-yellow-600 font-medium">Not Checked In</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vitals Form */}
          {selectedAppointmentData?.checkedIn ? (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-blue-600" />
                Vital Signs Measurement
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {vitalInputs.map((vital) => (
                  <div key={vital.key} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {vital.label}
                    </label>
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-${vital.color}-100 rounded-lg`}>
                        <span className={`text-${vital.color}-600`}>{vital.icon}</span>
                      </div>
                      <input
                        type="text"
                        placeholder={vital.placeholder}
                        value={vitals[vital.key]}
                        onChange={(e) => handleVitalChange(vital.key, e.target.value)}
                        className="w-full pl-16 pr-16 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {vital.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BMI Calculator */}
              {vitals.weight && vitals.height && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-3">
                    <Calculator className="w-6 h-6" />
                    Calculated BMI
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-purple-600">{calculateBMI()}</div>
                    <div className="text-purple-700">
                      <p className="font-medium">Body Mass Index</p>
                      <p className="text-sm">
                        {(() => {
                          const bmi = parseFloat(calculateBMI());
                          if (bmi < 18.5) return "Underweight";
                          if (bmi < 25) return "Normal weight";
                          if (bmi < 30) return "Overweight";
                          return "Obese";
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submitVitals}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-pink-700 hover:to-red-700 transition-all duration-200 shadow-xl hover:shadow-pink-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Recording Vitals...
                  </div>
                ) : (
                  <>
                    <HeartPulse className="w-6 h-6 inline mr-3" />
                    Save Vital Signs
                  </>
                )}
              </button>
            </div>
          ) : selectedAppointmentData && !selectedAppointmentData.checkedIn ? (
            <div className="p-16 text-center">
              <AlertCircle className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Patient Not Checked In</h3>
              <p className="text-gray-600 text-lg">
                Patient must be checked in before vitals can be recorded. Please ask the receptionist to check in the patient first.
              </p>
            </div>
          ) : (
            <div className="p-16 text-center">
              <Clock className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Select a Patient</h3>
              <p className="text-gray-600 text-lg">
                Choose a checked-in patient from the dropdown above to begin recording vital signs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(RecordVitals, ["nurse"]);