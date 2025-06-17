"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { Plus, FlaskConical, X, Calendar, Clock, User, Stethoscope, CheckCircle, AlertCircle } from "lucide-react";

function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await fetch("/api/appointments/my");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
    setLoading(false);
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    const res = await fetch("/api/appointments/cancel", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    fetchAppointments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Calendar className="w-10 h-10 text-blue-600" />
                My Appointments
              </h1>
              <p className="text-gray-600 text-lg">Manage your healthcare appointments and track your medical journey</p>
            </div>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Schedule New Appointment
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes("successfully") || message.includes("cancelled")
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("cancelled") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-xs">
                  {message.includes("successfully") || message.includes("cancelled") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Appointments Scheduled</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have any appointments scheduled yet. Book your first appointment to get started with your healthcare journey.
            </p>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Schedule Your First Appointment
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  {/* Appointment Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-blue-600" />
                          {new Date(appt.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h2>
                        <p className="text-lg text-gray-600 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          {appt.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        appt.checkedIn 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}>
                        {appt.checkedIn ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            Pending Check-in
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Doctor</p>
                          <p className="font-semibold text-gray-900">{appt.doctor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Patient</p>
                          <p className="font-semibold text-gray-900">{appt.patient}</p>
                        </div>
                      </div>
                    </div>

                    {appt.vitals && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          Vital Signs Recorded
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-blue-600 font-medium">BP:</span> {appt.vitals.bloodPressure}
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">Temp:</span> {appt.vitals.temperature}°C
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">HR:</span> {appt.vitals.heartRate} bpm
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">O2:</span> {appt.vitals.oxygenSaturation}%
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">Weight:</span> {appt.vitals.weight} kg
                          </div>
                          <div>
                            <span className="text-blue-600 font-medium">BMI:</span> {appt.vitals.bmi}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {!appt.vitals && appt.checkedIn && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-6">
                      <p className="text-yellow-800 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Vitals not recorded yet. Please wait for the nurse to take your measurements.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {!appt.checkedIn && (
                      <button
                        onClick={() => cancelAppointment(appt._id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                      >
                        <X className="w-4 h-4" />
                        Cancel Appointment
                      </button>
                    )}

                    {appt.checkedIn && (
                      <button
                        onClick={() => router.push(`/tests/order/${appt._id}`)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
                      >
                        <FlaskConical className="w-4 h-4" />
                        Order Lab Tests
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(MyAppointments, ["patient", "doctor"]);