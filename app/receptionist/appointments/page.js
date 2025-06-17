"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { Calendar, Clock, User, CheckCircle, AlertCircle, Search, Filter, UserCheck, Phone, MapPin } from "lucide-react";

function TodayAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    setMessage("Loading appointments...");
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
      setMessage("");
    } else {
      setMessage("Failed to fetch appointments.");
    }
    setLoading(false);
  };

  const checkInPatient = async (appointmentId) => {
    const res = await fetch("/api/appointments/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    fetchTodayAppointments(); // Refresh list after check-in
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "pending") return !appt.checkedIn && matchesSearch;
    if (filter === "checkedIn") return appt.checkedIn && matchesSearch;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Today's Appointments</h1>
                <p className="text-gray-600 text-xl">Manage patient check-ins and appointment flow</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                <div className="text-sm text-blue-600">Total Today</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.checkedIn).length}</div>
                <div className="text-sm text-green-600">Checked In</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{appointments.filter(a => !a.checkedIn).length}</div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{Math.round((appointments.filter(a => a.checkedIn).length / appointments.length) * 100) || 0}%</div>
                <div className="text-sm text-purple-600">Check-in Rate</div>
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
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All", count: appointments.length },
                { key: "pending", label: "Pending", count: appointments.filter(a => !a.checkedIn).length },
                { key: "checkedIn", label: "Checked In", count: appointments.filter(a => a.checkedIn).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    filter === tab.key
                      ? "bg-yellow-600 text-white shadow-lg"
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

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Calendar className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Appointments Found</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No appointments scheduled for today." : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      {appt.patientName.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{appt.patientName}</h3>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
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
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span><strong>Time:</strong> {appt.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-green-500" />
                          <span><strong>Doctor:</strong> {appt.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span><strong>Date:</strong> {appt.date}</span>
                        </div>
                      </div>
                      
                      {appt.checkedIn && appt.checkInTime && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-700 text-sm">
                            <strong>Checked in at:</strong> {appt.checkInTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!appt.checkedIn ? (
                      <button
                        onClick={() => checkInPatient(appt._id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                      >
                        <UserCheck className="w-5 h-5" />
                        Check In
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Patient Ready
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                        <MapPin className="w-4 h-4" />
                        Locate
                      </button>
                    </div>
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

export default withAuth(TodayAppointments, ["receptionist", "doctor"]);