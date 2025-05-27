"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PatientListPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch("/api/patients");
                const data = await res.json();
                if (res.ok) {
                    setPatients(data.patients);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error("Error loading patients:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Filter patients based on search input
    const filteredPatients = patients.filter((patient) => {
        const searchLower = search.toLowerCase();
        return (
            patient.name.toLowerCase().includes(searchLower) ||
            (patient.idNumber && patient.idNumber.toLowerCase().includes(searchLower)) ||
            (patient.title && patient.title.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="p-8 bg-white rounded-lg shadow-lg mt-10">
            <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight">
                Patient List
            </h1>

            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search by name, ID, or title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span className="text-lg text-gray-700">Loading patients...</span>
                </div>
            ) : filteredPatients.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">No patients found.</p>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPatients.map((patient) => (
                        <li
                            key={patient._id}
                            className="bg-gray-50 rounded-xl shadow hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                        >
                            <div>
                                <p className="font-bold text-lg text-gray-800 mb-1">
                                    {patient.title} {patient.name}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                    <span className="font-medium">ID:</span> {patient.idNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium">Gender:</span> {patient.gender}
                                </p>
                            </div>
                            <Link
                                href={`/tests/history/${patient._id}`}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow"
                            >
                                <span className="mr-2">📄</span> View Lab History
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
