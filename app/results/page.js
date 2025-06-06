'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/loader';
import toast from 'react-hot-toast';

export default function TestResultsList() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const res = await fetch('/api/results');
        const data = await res.json();
        if (res.ok) {
          setTestResults(data.testResults);
        } else {
          toast.error(data.message || 'Failed to fetch test results');
        }
      } catch (err) {
        toast.error('Error fetching test results');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">🧪 Lab Test Results</h2>
      <Link href="/results/register">
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"> 
          Add New Test Result
        </button>
      </Link>
      {testResults.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          No test results found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white text-sm text-gray-700">
            <thead className="bg-blue-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Test Name</th>
                <th className="px-6 py-4 text-left">Patient</th>
                <th className="px-6 py-4 text-left">Recorded By</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, idx) => (
                <tr
                  key={result._id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{result.testName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{result.testOrderId.appointmentId.patientId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{result.recordedBy?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(result.recordedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/results/${result._id}`} className="inline-block px-3 py-1 bg-pink-600 text-white rounded hover:bg-blue-700 transition">
                       Details
                    </Link>
                    <Link
                      href={`/results/feedback/${result._id}`}
                      className="inline-block px-3 py-1 ml-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Feedback
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
