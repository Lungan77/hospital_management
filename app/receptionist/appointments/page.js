"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function TodayAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    setMessage("Loading...");
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
      setMessage("");
    } else {
      setMessage("Failed to fetch appointments.");
    }
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Today's Appointments</h1>
      {message && <p className="mt-2 text-green-600">{message}</p>}

      {appointments.length === 0 ? (
        <p>No appointments scheduled for today.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {appointments.map((appt) => (
            <li key={appt._id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">{appt.timeSlot}</p>
                <p>Date: <span className="font-bold">{appt.date}</span></p>
                <p>Patient: <span className="font-bold">{appt.patientName}</span></p>
                <p>Doctor: <span className="font-bold">{appt.doctorName}</span></p>
                <p>Checked In: <span className={`font-bold ${appt.checkedIn ? "text-green-600" : "text-red-500"}`}>
                  {appt.checkedIn ? `Yes (at ${appt.checkInTime})` : "No"}
                </span></p>
              </div>

              {!appt.checkedIn && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => checkInPatient(appt._id)}>
                  Check In
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(TodayAppointments, ["receptionist", "doctor"]);
