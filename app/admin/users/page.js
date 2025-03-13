"use client";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password01"); 
  const [role, setRole] = useState("doctor");
  const [message, setMessage] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/admin/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("User created successfully!");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Add New User</h2>
      {message && <p className="mt-2 text-red-500">{message}</p>}
      <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
        <input type="text" placeholder="Full Name" className="p-2 border w-full" onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" className="p-2 border w-full" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (optional)" className="p-2 border w-full" onChange={(e) => setPassword(e.target.value)} />
        <select className="p-2 border w-full" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="doctor">Doctor</option>
          <option value="nurse">Nurse</option>
          <option value="receptionist">Receptionist</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="p-2 bg-blue-600 text-white w-full rounded-lg hover:bg-blue-700">Create User</button>
      </form>
    </div>
  );
}

export default withAuth(AddUser, ["admin"]);
