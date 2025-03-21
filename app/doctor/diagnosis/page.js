"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";

function RecordDiagnosis() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [symptomsDuration, setSymptomsDuration] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [severity, setSeverity] = useState("Mild"); // ✅ Default value set
  const [labTestsOrdered, setLabTestsOrdered] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    }
  }, [session]);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
  };

  const submitDiagnosis = async () => {
    if (!selectedAppointment || !symptoms || !diagnosis || !severity) {
      setMessage("Please fill in all required fields, including severity.");
      return;
    }

    const res = await fetch("/api/diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: selectedAppointment, symptoms, symptomsDuration, diagnosis, severity, labTestsOrdered, notes }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Record Diagnosis</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      <label className="block mt-4">Select Appointment</label>
      <select className="p-2 border w-full mt-2" onChange={(e) => setSelectedAppointment(e.target.value)}>
        <option value="">-- Choose an appointment --</option>
        {appointments
          .filter((appt) => appt.checkedIn && appt.doctorId === session?.user._id)
          .map((appt) => (
            <option key={appt._id} value={appt._id}>
              {appt.patientName} - {appt.timeSlot} with Dr. {appt.doctorName}
            </option>
          ))}
      </select>

      <textarea placeholder="Symptoms" className="p-2 border w-full mt-4" onChange={(e) => setSymptoms(e.target.value)} />
      <input type="text" placeholder="Symptoms Duration" className="p-2 border w-full mt-4" onChange={(e) => setSymptomsDuration(e.target.value)} />
      <textarea placeholder="Diagnosis" className="p-2 border w-full mt-4" onChange={(e) => setDiagnosis(e.target.value)} />

      <label className="block mt-4">Severity</label>
      <select className="p-2 border w-full" onChange={(e) => setSeverity(e.target.value)} value={severity}>
        <option value="Mild">Mild</option>
        <option value="Moderate">Moderate</option>
        <option value="Severe">Severe</option>
      </select>

      <textarea placeholder="Lab Tests Ordered (optional)" className="p-2 border w-full mt-4" onChange={(e) => setLabTestsOrdered(e.target.value)} />
      <textarea placeholder="Additional Notes (optional)" className="p-2 border w-full mt-4" onChange={(e) => setNotes(e.target.value)} />

      <button onClick={submitDiagnosis} className="mt-6 p-2 bg-green-600 text-white w-full rounded-lg hover:bg-green-700">
        Save Diagnosis
      </button>
    </div>
  );
}

export default withAuth(RecordDiagnosis, ["doctor"]);
