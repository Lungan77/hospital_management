"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">Patient Registration</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="mt-6">
          <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border" onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" className="w-full px-4 py-2 border mt-4" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full px-4 py-2 border mt-4" onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full mt-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Register</button>
        </form>
      </div>
    </div>
  );
}
