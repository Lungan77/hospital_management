"use client";

import { useState } from "react";
import withAuth from "@/hoc/withAuth";

function AddUser() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Title");
  const [email, setEmail] = useState("");
  const [idNumber, setidNumber] = useState("");
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("Gender");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Role");
  const [message, setMessage] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const res = await fetch("/api/admin/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, title, email, idNumber, password, phone, gender, role }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("User created successfully!");
    } else {
      setMessage(data.error || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Add New User</h2>
        
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            >
              <option value="Title">Title</option>
              <option value="Dr">Dr.</option>
              <option value="Mr">Mr.</option>
              <option value="Miss">Miss</option>
              <option value="Mrs">Mrs.</option>
              <option value="Prof">Prof.</option>
            </select>

            <input
              type="text"
              placeholder="Full Name"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Phone"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            
            <input
              type="number"
              placeholder="ID Number"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setidNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="Gender">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="role">User Role</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
            </select>

            <input
              type="password"
              placeholder="Password"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAuth(AddUser, ["admin"]);
