"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import withAuth from "@/hoc/withAuth";

function MyAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments/my");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
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
    fetchAppointments(); // Refresh appointments after cancellation
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Appointments</h1>

      <div className="flex justify-between mt-4">
        {/* ✅ Button to add new appointment */}
        <button
          onClick={() => router.push("/appointments/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Appointment
        </button>
      </div>

      {message && <p className="mt-2 text-red-500">{message}</p>}

      {appointments.length === 0 ? (
        <p>No appointments scheduled.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {appointments.map((appt) => (
            <li key={appt._id} className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-semibold">{appt.date} - {appt.timeSlot}</p>
              <p>Doctor: <span className="font-bold">{appt.doctor}</span></p>
              <p>Patient: <span className="font-bold">{appt.patient}</span></p>
              <p>Checked In: <span className={`font-bold ${appt.checkedIn ? "text-green-600" : "text-red-500"}`}>
                {appt.checkedIn ? "Yes" : "No"}
              </span></p>

              {appt.vitals ? (
                <div className="mt-2 p-2 bg-white rounded-lg">
                  <p className="text-md font-semibold">Vitals Recorded:</p>
                  <p>Blood Pressure: {appt.vitals.bloodPressure}</p>
                  <p>Temperature: {appt.vitals.temperature}°C</p>
                  <p>Heart Rate: {appt.vitals.heartRate} bpm</p>
                  <p>Respiratory Rate: {appt.vitals.respiratoryRate} breaths/min</p>
                  <p>Oxygen Saturation: {appt.vitals.oxygenSaturation}%</p>
                  <p>Weight: {appt.vitals.weight} kg</p>
                  <p>Height: {appt.vitals.height} cm</p>
                  <p className="font-bold">BMI: {appt.vitals.bmi}</p>
                </div>
              ) : (
                <p className="text-gray-500">Vitals not recorded yet.</p>
              )}

              {/* ✅ Button to cancel appointment */}
              <button
                onClick={() => cancelAppointment(appt._id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel Appointment
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(MyAppointments, ["patient", "doctor"]);
