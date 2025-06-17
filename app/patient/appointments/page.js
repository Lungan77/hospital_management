"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { Calendar, Clock, User, Stethoscope, CheckCircle, Search } from "lucide-react";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (res.ok) setDoctors(data.doctors);
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAvailableSlots = async () => {
    if (!doctorId || !date) {
      setMessage("Please select a doctor and date.");
      return;
    }

    setLoading(true);
    setMessage("Fetching available slots...");
    
    const res = await fetch("/api/timeslots/available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date }),
    });

    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      setAvailableSlots(data.slots);
      setMessage(data.slots.length > 0 ? "" : "No available slots for this date.");
    } else {
      setMessage("Failed to fetch available slots.");
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return;

    setLoading(true);
    setMessage("Booking appointment...");
    
    const res = await fetch("/api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, timeSlot: selectedSlot }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
    
    if (res.ok) {
      // Reset form
      setDoctorId("");
      setDate("");
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  };

  const selectedDoctor = doctors.find(doc => doc._id === doctorId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
            <p className="text-gray-600 text-lg">Schedule your visit with our healthcare professionals</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes("successfully") || message.includes("booked")
              ? "bg-green-50 border-green-200 text-green-700" 
              : message.includes("Fetching") || message.includes("Booking")
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("booked") ? "bg-green-500" : 
                message.includes("Fetching") || message.includes("Booking") ? "bg-blue-500" : "bg-red-500"
              }`}>
                {loading ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white text-xs">
                    {message.includes("successfully") || message.includes("booked") ? "✓" : "!"}
                  </span>
                )}
              </div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step 1: Select Doctor */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              Select Doctor
            </h2>
            
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => setDoctorId(doc._id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    doctorId === doc._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{doc.title} {doc.name}</p>
                      <p className="text-sm text-gray-600">Healthcare Provider</p>
                    </div>
                  </div>
                  {doctorId === doc._id && (
                    <div className="mt-3 flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Date */}
          {doctorId && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                Select Date
              </h2>
              
              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {date && (
                <button
                  onClick={fetchAvailableSlots}
                  disabled={loading}
                  className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Checking Availability...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Check Available Slots
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Step 3: Select Time Slot */}
          {availableSlots.length > 0 && (
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                Select Time Slot
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedSlot === slot
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm Booking */}
          {selectedSlot && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                Confirm Booking
              </h2>
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6">
                <h3 className="font-semibold text-blue-900 mb-4">Appointment Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Doctor:</strong> {selectedDoctor?.title} {selectedDoctor?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Date:</strong> {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800">
                      <strong>Time:</strong> {selectedSlot}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={bookAppointment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Booking Appointment...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Confirm Booking
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

export default withAuth(BookAppointment, ["patient"]);