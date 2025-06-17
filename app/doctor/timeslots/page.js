"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { Calendar, Clock, Plus, Trash2, Save, CheckCircle, AlertCircle, CalendarDays, Timer } from "lucide-react";

const availableTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

function AddTimeSlots() {
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setMessage("Fetching time slots...");
    setSuccess(false);

    try {
      const res = await fetch("/api/timeslots/my");
      const data = await res.json();
      if (res.ok) {
        setTimeSlots(data.slots);
        setMessage("");
      } else {
        setMessage("Failed to load time slots.");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const saveTimeSlots = async () => {
    if (!date || selectedSlots.length === 0) {
      setMessage("Please select a date and at least one time slot.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("Saving time slots...");
    setSuccess(false);

    try {
      const res = await fetch("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, slots: selectedSlots }),
      });

      const data = await res.json();
      setLoading(false);
      
      if (res.ok) {
        setSuccess(true);
        setMessage("Time slots saved successfully!");
        setSelectedSlots([]);
        setDate("");
        fetchTimeSlots();
      } else {
        setSuccess(false);
        setMessage(data.error || "Failed to save time slots.");
      }
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      setMessage("Server error. Please try again.");
    }
  };

  const deleteTimeSlot = async (id) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;
    
    setMessage("Deleting time slot...");
    try {
      const res = await fetch("/api/timeslots/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      fetchTimeSlots();
    } catch (error) {
      setMessage("Failed to delete time slot.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Manage Time Slots</h1>
            <p className="text-gray-600 text-xl">Set your availability and manage appointment scheduling</p>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            success 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                success ? "bg-green-500" : "bg-red-500"
              }`}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-white text-sm font-bold">
                    {success ? "✓" : "!"}
                  </span>
                )}
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add New Time Slots */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Plus className="w-8 h-8" />
                Add New Time Slots
              </h2>
              <p className="text-blue-100">Set your availability for patient appointments</p>
            </div>

            <div className="p-8">
              {/* Date Picker */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
                  />
                </div>
              </div>
              
              {/* Time Slot Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Available Time Slots</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSlotToggle(time)}
                      className={`group p-4 border-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg ${
                        selectedSlots.includes(time)
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg transform scale-105"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-sm">{time}</div>
                      {selectedSlots.includes(time) && (
                        <CheckCircle className="w-4 h-4 mx-auto mt-2 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={saveTimeSlots}
                disabled={loading || !date || selectedSlots.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Time Slots
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Existing Time Slots */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Timer className="w-8 h-8" />
                Your Time Slots
              </h2>
              <p className="text-indigo-100">Manage your existing availability</p>
            </div>

            <div className="p-8">
              {timeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Time Slots Set</h3>
                  <p className="text-gray-600">Add your first time slot to start accepting appointments</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <div key={slot._id} className="group p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {new Date(slot.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h3>
                              <p className="text-sm text-gray-600">{slot.slots.length} time slots available</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {slot.slots.map((time, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
                              >
                                <Clock className="w-3 h-3" />
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => deleteTimeSlot(slot._id)}
                          className="ml-4 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors group-hover:scale-110 transform duration-200"
                          title="Delete time slot"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Dates", value: timeSlots.length, color: "blue", icon: <Calendar className="w-6 h-6" /> },
            { label: "Total Slots", value: timeSlots.reduce((sum, slot) => sum + slot.slots.length, 0), color: "indigo", icon: <Clock className="w-6 h-6" /> },
            { label: "This Week", value: timeSlots.filter(s => new Date(s.date) >= new Date() && new Date(s.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, color: "purple", icon: <CalendarDays className="w-6 h-6" /> },
            { label: "Available Today", value: timeSlots.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((sum, slot) => sum + slot.slots.length, 0), color: "green", icon: <Timer className="w-6 h-6" /> }
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

export default withAuth(AddTimeSlots, ["doctor"]);