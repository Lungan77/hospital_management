"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function RecordVitals() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments/today");
    const data = await res.json();
    if (res.ok) {
      setAppointments(data.appointments);
    } else {
      setMessage("Failed to fetch appointments.");
    }
  };

  const handleAppointmentSelection = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointmentData(appointment);
  };

  const submitVitals = async () => {
    if (!selectedAppointmentData?.checkedIn) {
      setMessage("Patient must be checked in before recording vitals.");
      return;
    }

    if (!selectedAppointment || !bloodPressure || !temperature || !heartRate || !respiratoryRate || !oxygenSaturation || !weight || !height) {
      setMessage("Please fill in all fields.");
      return;
    }

    const res = await fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: selectedAppointment, bloodPressure, temperature, heartRate, respiratoryRate, oxygenSaturation, weight, height }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Record Vital Signs</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      <label className="block mt-4">Select Appointment</label>
      <select className="p-2 border w-full" onChange={(e) => handleAppointmentSelection(e.target.value)}>
        <option value="">-- Choose an appointment --</option>
        {appointments.map((appt) => (
          <option key={appt._id} value={appt._id}>
            {appt.patientName} - {appt.timeSlot} with Dr. {appt.doctorName} {appt.checkedIn ? "(Checked In)" : "(Not Checked In)"}
          </option>
        ))}
      </select>

      {selectedAppointmentData?.checkedIn ? (
        <>
          <input type="text" placeholder="Blood Pressure" className="p-2 border w-full mt-4" onChange={(e) => setBloodPressure(e.target.value)} />
          <input type="text" placeholder="Temperature (°C)" className="p-2 border w-full mt-4" onChange={(e) => setTemperature(e.target.value)} />
          <input type="text" placeholder="Heart Rate (bpm)" className="p-2 border w-full mt-4" onChange={(e) => setHeartRate(e.target.value)} />
          <input type="text" placeholder="Respiratory Rate (breaths/min)" className="p-2 border w-full mt-4" onChange={(e) => setRespiratoryRate(e.target.value)} />
          <input type="text" placeholder="Oxygen Saturation (%)" className="p-2 border w-full mt-4" onChange={(e) => setOxygenSaturation(e.target.value)} />
          <input type="text" placeholder="Weight (kg)" className="p-2 border w-full mt-4" onChange={(e) => setWeight(e.target.value)} />
          <input type="text" placeholder="Height (cm)" className="p-2 border w-full mt-4" onChange={(e) => setHeight(e.target.value)} />

          <button onClick={submitVitals} className="mt-6 p-2 bg-green-600 text-white w-full rounded-lg hover:bg-green-700">
            Save Vitals
          </button>
        </>
      ) : (
        <p className="text-red-500 mt-4">Patient must be checked in before vitals can be recorded.</p>
      )}
    </div>
  );
}

export default withAuth(RecordVitals, ["nurse"]);
