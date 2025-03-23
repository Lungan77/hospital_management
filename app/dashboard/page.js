"use client";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import Loader from "@/components/loader"; // Keep loader for UX

function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />; 
  
  if (!session || !session.user) {
    return <p className="text-center mt-10 text-red-600">Error: User not found</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-gray-600">Role: {session.user.role}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {session.user.role === "admin" && <div className="p-4 bg-white shadow-md rounded-lg">Manage Users</div>}
        {session.user.role === "doctor" && <div className="p-4 bg-white shadow-md rounded-lg">View Appointments</div>}
        {session.user.role === "receptionist" && <div className="p-4 bg-white shadow-md rounded-lg">Check-in Patients</div>}
        {session.user.role === "nurse" && <div className="p-4 bg-white shadow-md rounded-lg">Record Vitals</div>}
        {session.user.role === "patient" && <div className="p-4 bg-white shadow-md rounded-lg">Schedule Appointment</div>}
      </div>
    </div>
  );
}

export default withAuth(Dashboard, ["admin", "doctor", "nurse", "receptionist", "patient"]);
