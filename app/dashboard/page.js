"use client";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import Loader from "@/components/loader";

const roleCards = [
  {
    role: "admin",
    title: "Manage Users",
    description: "Add, edit, or remove users and assign roles.",
    icon: (
      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0zm6 4v2a2 2 0 01-2 2h-1.5M3 16v2a2 2 0 002 2h1.5" />
      </svg>
    ),
  },
  {
    role: "doctor",
    title: "View Appointments",
    description: "See your upcoming appointments and patient details.",
    icon: (
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    role: "receptionist",
    title: "Check-in Patients",
    description: "Register and check-in patients quickly.",
    icon: (
      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 11c0-1.1.9-2 2-2h4a2 2 0 012 2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6zm-6 0c0-1.1.9-2 2-2h4a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6z" />
      </svg>
    ),
  },
  {
    role: "nurse",
    title: "Record Vitals",
    description: "Update and monitor patient vitals.",
    icon: (
      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    role: "patient",
    title: "Schedule Appointment",
    description: "Book and manage your appointments.",
    icon: (
      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    role: "labtech",
    title: "Manage Lab Results",
    description: "Upload and review laboratory results.",
    icon: (
      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" />
      </svg>
    ),
  },
];

function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />;

  if (!session || !session.user) {
    return <p className="text-center mt-10 text-red-600">Error: User not found</p>;
  }

  const userRole = session.user.role;

  return (
    <div className="py-10 px-4">
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8 mb-8 shadow">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Welcome, <span className="text-blue-600">{session.user.name}</span>
        </h1>
        <p className="text-lg text-gray-600">Role: <span className="font-semibold">{userRole}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {roleCards
          .filter(card => card.role === userRole)
          .map(card => (
            <div
              key={card.role}
              className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{card.icon}</div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">{card.title}</h2>
              <p className="text-gray-500 text-center">{card.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default withAuth(Dashboard, ["admin", "doctor", "nurse", "receptionist", "patient", "labtech"]);
