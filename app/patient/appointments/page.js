"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { Calendar, Clock, User, Stethoscope, CheckCircle, Search, MapPin, Phone, Star, Filter } from "lucide-react";

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Book an Appointment</h1>
            <p className="text-gray-600 text-xl">Schedule your visit with our healthcare professionals</p>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") || message.includes("booked")
              ? "bg-green-50 border-green-500 text-green-700" 
              : message.includes("Fetching") || message.includes("Booking")
              ? "bg-blue-50 border-blue-500 text-blue-700"
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") || message.includes("booked") ? "bg-green-500" : 
                message.includes("Fetching") || message.includes("Booking") ? "bg-blue-500" : "bg-red-500"
              }`}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white text-sm font-bold">
                    {message.includes("successfully") || message.includes("booked") ? "✓" : "!"}
                  </span>
                )}
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step 1: Select Doctor */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">1</div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Select Doctor</h2>
                <p className="text-gray-600">Choose from our experienced healthcare professionals</p>
              </div>
            </div>
            
            {/* Enhanced Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors by name or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="pl-12 pr-8 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none min-w-[200px]"
                >
                  <option value="">All Specialties</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="neurology">Neurology</option>
                  <option value="pediatrics">Pediatrics</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => setDoctorId(doc._id)}
                  className={`group p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    doctorId === doc._id
                      ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {doc.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{doc.title} {doc.name}</h3>
                      <p className="text-sm text-gray-600">Healthcare Provider</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Main Building, Floor 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                  
                  {doctorId === doc._id && (
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Date */}
          {doctorId && (
            <div className="p-8 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Select Date</h2>
                  <p className="text-gray-600">Choose your preferred appointment date</p>
                </div>
              </div>
              
              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Appointment Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-lg"
                />
              </div>

              {date && (
                <button
                  onClick={fetchAvailableSlots}
                  disabled={loading}
                  className="mt-6 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Checking Availability...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
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
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Select Time Slot</h2>
                  <p className="text-gray-600">Choose your preferred appointment time</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`group p-4 border-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg ${
                      selectedSlot === slot
                        ? "border-purple-500 bg-purple-50 text-purple-700 shadow-lg transform scale-105"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700"
                    }`}
                  >
                    <Clock className="w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-sm">{slot}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm Booking */}
          {selectedSlot && (
            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">4</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Confirm Booking</h2>
                  <p className="text-gray-600">Review your appointment details</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 border-2 border-green-200 mb-8 shadow-lg">
                <h3 className="font-bold text-green-900 mb-6 text-xl">Appointment Summary</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="font-semibold text-gray-900">{selectedDoctor?.title} {selectedDoctor?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">{selectedSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">Main Building, Floor 2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={bookAppointment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-xl hover:shadow-green-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Booking Appointment...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 inline mr-3" />
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