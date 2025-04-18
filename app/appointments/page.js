"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { Plus, FlaskConical, X } from "lucide-react";

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
    fetchAppointments();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <button
          onClick={() => router.push("/patient/appointments")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {message && <p className="mb-4 text-red-500 font-semibold">{message}</p>}

      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments scheduled.</p>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white shadow-sm rounded-xl p-5 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {new Date(appt.date).toLocaleDateString()} – {appt.timeSlot}
                  </h2>
                  <p className="text-gray-700 mt-1">Doctor: <strong>{appt.doctor}</strong></p>
                  <p className="text-gray-700">Patient: <strong>{appt.patient}</strong></p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appt.checkedIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {appt.checkedIn ? "Checked In" : "Not Checked In"}
                </span>
              </div>

              {appt.vitals ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-700">
                  <p>Blood Pressure: <strong>{appt.vitals.bloodPressure}</strong></p>
                  <p>Temperature: <strong>{appt.vitals.temperature}°C</strong></p>
                  <p>Heart Rate: <strong>{appt.vitals.heartRate} bpm</strong></p>
                  <p>Respiratory Rate: <strong>{appt.vitals.respiratoryRate} bpm</strong></p>
                  <p>Oxygen Saturation: <strong>{appt.vitals.oxygenSaturation}%</strong></p>
                  <p>Weight: <strong>{appt.vitals.weight} kg</strong></p>
                  <p>Height: <strong>{appt.vitals.height} cm</strong></p>
                  <p>BMI: <strong>{appt.vitals.bmi}</strong></p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Vitals not recorded yet.</p>
              )}

              <div className="flex gap-3 mt-5">
                {!appt.checkedIn && (
                  <button
                    onClick={() => cancelAppointment(appt._id)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}

                {appt.checkedIn && (
                  <button
                    onClick={() => router.push(`/tests/order/${appt._id}`)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Book Lab Test
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(MyAppointments, ["patient", "doctor"]);
