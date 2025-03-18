"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

const availableTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"];

function AddTimeSlots() {
  const [date, setDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); // Stores existing slots
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch existing time slots when the page loads
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

    setMessage("Saving time slots...");
    setSuccess(false);

    try {
      const res = await fetch("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, slots: selectedSlots }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Time slots saved successfully!");
        setSelectedSlots([]); // Clear selected slots
        fetchTimeSlots(); // Refresh list after saving
      } else {
        setSuccess(false);
        setMessage(data.error || "Failed to save time slots.");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Server error. Please try again.");
    }
  };

  const deleteTimeSlot = async (id) => {
    setMessage("Deleting time slot...");
    try {
      const res = await fetch("/api/timeslots/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      fetchTimeSlots(); // Refresh time slots
    } catch (error) {
      setMessage("Failed to delete time slot.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manage Time Slots</h1>
      {message && (
        <p className={`mt-2 ${success ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      )}

      {/* Date Picker */}
      <input type="date" className="p-2 border w-full mt-4" onChange={(e) => setDate(e.target.value)} />
      
      {/* Time Slot Selection */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {availableTimes.map((time) => (
          <button key={time} 
            className={`p-2 border rounded ${selectedSlots.includes(time) ? "bg-blue-600 text-white" : "bg-gray-200"}`} 
            onClick={() => handleSlotToggle(time)}>
            {time}
          </button>
        ))}
      </div>

      <button onClick={saveTimeSlots} className="mt-6 p-2 bg-green-600 text-white w-full rounded-lg hover:bg-green-700">
        Save Time Slots
      </button>

      {/* Display Existing Time Slots */}
      <h2 className="text-xl font-bold mt-8">Your Time Slots</h2>
      {timeSlots.length === 0 ? (
        <p>No time slots set.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {timeSlots.map((slot) => (
            <li key={slot._id} className="flex justify-between bg-gray-100 p-2 rounded-lg">
              <span>{slot.date} - {slot.slots.join(", ")}</span>
              <button className="text-red-600" onClick={() => deleteTimeSlot(slot._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(AddTimeSlots, ["doctor"]); // Protect the page for doctors only
