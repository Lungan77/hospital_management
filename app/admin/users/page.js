"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Link
            key="/admin/users/create"
            href="/admin/users/create"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700"
          >Add User</Link>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="mt-4 w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Full Name</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Gender</th>
              <th className="border p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border">
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{user.title || "-"}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.phone || "-"}</td>
                  <td className="border p-2">{user.gender || "-"}</td>
                  <td className="border p-2 capitalize">{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}