"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { Plus, FlaskConical, X, Calendar, Clock, User, Stethoscope, CheckCircle, AlertCircle, MapPin, Phone, Star, Activity } from "lucide-react";

function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filteredAppointments = appointments.filter(appt => {
    if (filter === "upcoming") return !appt.checkedIn && new Date(appt.date) >= new Date();
    if (filter === "completed") return appt.checkedIn;
    if (filter === "past") return new Date(appt.date) < new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                <Calendar className="w-12 h-12 text-blue-600" />
                My Appointments
              </h1>
              <p className="text-gray-600 text-xl">Manage your healthcare appointments and track your medical journey</p>
            </div>
            <button
              onClick={() => router.push("/patient/appointments")}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Schedule New Appointment
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Appointments", count: appointments.length },
              { key: "upcoming", label: "Upcoming", count: appointments.filter(a => !a.checkedIn && new Date(a.date) >= new Date()).length },
              { key: "completed", label: "Completed", count: appointments.filter(a => a.checkedIn).length },
              { key: "past", label: "Past", count: appointments.filter(a => new Date(a.date) < new Date()).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
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

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-lg ${
            message.includes("successfully") || message.includes("cancelled")
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("cancelled") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") || message.includes("cancelled") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Calendar className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Appointments Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {filter === "all" 
                ? "You don't have any appointments scheduled yet. Book your first appointment to get started with your healthcare journey."
                : `No ${filter} appointments found.`
              }
            </p>
            {filter === "all" && (
              <button
                onClick={() => router.push("/patient/appointments")}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Schedule Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredAppointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="p-8">
                  {/* Appointment Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Stethoscope className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                          <Calendar className="w-8 h-8 text-blue-600" />
                          {new Date(appt.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h2>
                        <p className="text-xl text-gray-600 flex items-center gap-3">
                          <Clock className="w-6 h-6 text-gray-400" />
                          {appt.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-lg font-semibold ${
                        appt.checkedIn 
                          ? "bg-green-100 text-green-700 border-2 border-green-200" 
                          : "bg-yellow-100 text-yellow-700 border-2 border-yellow-200"
                      }`}>
                        {appt.checkedIn ? (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-6 h-6" />
                            Pending Check-in
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Doctor</p>
                          <p className="font-bold text-blue-900 text-lg">{appt.doctor}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current text-yellow-400" />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Patient</p>
                          <p className="font-bold text-purple-900 text-lg">{appt.patient}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Location</p>
                          <p className="font-bold text-gray-900 text-lg">Main Building, Floor 2</p>
                        </div>
                      </div>
                    </div>

                    {appt.vitals && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-6 text-xl flex items-center gap-3">
                          <Activity className="w-6 h-6" />
                          Vital Signs Recorded
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Blood Pressure", value: appt.vitals.bloodPressure, unit: "" },
                            { label: "Temperature", value: appt.vitals.temperature, unit: "°C" },
                            { label: "Heart Rate", value: appt.vitals.heartRate, unit: "bpm" },
                            { label: "Oxygen Sat.", value: appt.vitals.oxygenSaturation, unit: "%" },
                            { label: "Weight", value: appt.vitals.weight, unit: "kg" },
                            { label: "BMI", value: appt.vitals.bmi, unit: "" }
                          ].map((vital, index) => (
                            <div key={index} className="bg-white rounded-xl p-3 shadow-sm">
                              <p className="text-xs text-blue-600 font-medium">{vital.label}</p>
                              <p className="text-lg font-bold text-blue-900">{vital.value}{vital.unit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {!appt.vitals && appt.checkedIn && (
                    <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200 mb-8">
                      <p className="text-yellow-800 text-lg flex items-center gap-3">
                        <AlertCircle className="w-6 h-6" />
                        Vitals not recorded yet. Please wait for the nurse to take your measurements.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {!appt.checkedIn && new Date(appt.date) >= new Date() && (
                      <button
                        onClick={() => cancelAppointment(appt._id)}
                        className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
                      >
                        <X className="w-5 h-5" />
                        Cancel Appointment
                      </button>
                    )}

                    {appt.checkedIn && (
                      <button
                        onClick={() => router.push(`/tests/order/${appt._id}`)}
                        className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
                      >
                        <FlaskConical className="w-5 h-5" />
                        Order Lab Tests
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/appointment/${appt._id}/details`)}
                      className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                    >
                      <Calendar className="w-5 h-5" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Appointments", value: appointments.length, color: "blue", icon: <Calendar className="w-6 h-6" /> },
            { label: "Completed", value: appointments.filter(a => a.checkedIn).length, color: "green", icon: <CheckCircle className="w-6 h-6" /> },
            { label: "Upcoming", value: appointments.filter(a => !a.checkedIn && new Date(a.date) >= new Date()).length, color: "yellow", icon: <Clock className="w-6 h-6" /> },
            { label: "This Month", value: appointments.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length, color: "purple", icon: <Activity className="w-6 h-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(MyAppointments, ["patient", "doctor"]);