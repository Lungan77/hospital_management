"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth"; // Protects route

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (res.ok) setDoctors(data.doctors);
    };
    fetchDoctors();
  }, []);

  const fetchAvailableSlots = async () => {
    if (!doctorId || !date) {
      setMessage("Please select a doctor and date.");
      return;
    }

    setMessage("Fetching available slots...");
    const res = await fetch("/api/timeslots/available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date }),
    });

    if (res.ok){
      const data = await res.json();
      setAvailableSlots(data.slots);
    }else{
      setMessage(data.slots.length > 0 ? "" : "No available slots for this date.");
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return;

    setMessage("Booking appointment...");
    const res = await fetch("/api/appointments/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, timeSlot: selectedSlot }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Book an Appointment</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      <label className="block mt-4">Select Doctor</label>
      <select className="p-2 border w-full" onChange={(e) => setDoctorId(e.target.value)}>
        <option value="">-- Choose a doctor --</option>
        {doctors.map((doc) => (
          <option key={doc._id} value={doc._id}>
            {doc.title} {doc.name}
          </option>
        ))}
      </select>

      <label className="block mt-4">Select Date</label>
      <input type="date" className="p-2 border w-full" onChange={(e) => setDate(e.target.value)} />

      <button onClick={fetchAvailableSlots} className="mt-4 bg-blue-600 text-white px-4 py-2">Check Available Slots</button>

      {availableSlots.length > 0 && (
        <>
          <label className="block mt-4">Select Time Slot</label>
          <select className="p-2 border w-full" onChange={(e) => setSelectedSlot(e.target.value)}>
            <option value="">-- Choose a time slot --</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>

          <button onClick={bookAppointment} className="mt-6 bg-green-600 text-white px-4 py-2">Book Now</button>
        </>
      )}
    </div>
  );
}

export default withAuth(BookAppointment, ["patient"]);
