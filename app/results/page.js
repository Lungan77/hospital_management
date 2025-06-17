'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loader from '@/components/loader';
import toast from 'react-hot-toast';
import { FlaskConical, Plus, Search, Filter, User, Calendar, CheckCircle, Clock, AlertCircle, Eye, MessageSquare } from 'lucide-react';

export default function TestResultsList() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const filteredResults = testResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.testOrderId?.appointmentId?.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || result.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      "Completed": "bg-blue-100 text-blue-700 border-blue-200",
      "Approved": "bg-green-100 text-green-700 border-green-200",
      "Pending": "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Completed": <Clock className="w-4 h-4" />,
      "Approved": <CheckCircle className="w-4 h-4" />,
      "Pending": <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                <FlaskConical className="w-12 h-12 text-cyan-600" />
                Lab Test Results
              </h1>
              <p className="text-gray-600 text-xl">Comprehensive laboratory test results and analysis</p>
            </div>
            <Link href="/results/register">
              <button className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105">
                <Plus className="w-6 h-6" />
                Add New Test Result
              </button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by test name or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FlaskConical className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Test Results Found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm || statusFilter ? "No results match your current filters." : "No test results have been recorded yet."}
            </p>
            <Link href="/results/register">
              <button className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105">
                <Plus className="w-6 h-6" />
                Add First Test Result
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredResults.map((result) => (
              <div key={result._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <FlaskConical className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{result.testName}</h3>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(result.status)}`}>
                          {getStatusIcon(result.status)}
                          {result.status}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-green-500" />
                          <span><strong>Patient:</strong> {result.testOrderId?.appointmentId?.patientId?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-blue-500" />
                          <span><strong>Recorded by:</strong> {result.recordedBy?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span><strong>Date:</strong> {new Date(result.recordedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/results/${result._id}`}>
                      <button className="flex items-center gap-2 bg-cyan-50 text-cyan-600 px-4 py-2 rounded-xl font-medium hover:bg-cyan-100 transition-all duration-200">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </Link>
                    <Link href={`/results/feedback/${result._id}`}>
                      <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-all duration-200">
                        <MessageSquare className="w-4 h-4" />
                        Feedback
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Results", value: testResults.length, color: "cyan", icon: <FlaskConical className="w-6 h-6" /> },
            { label: "Completed", value: testResults.filter(r => r.status === "Completed").length, color: "blue", icon: <Clock className="w-6 h-6" /> },
            { label: "Approved", value: testResults.filter(r => r.status === "Approved").length, color: "green", icon: <CheckCircle className="w-6 h-6" /> },
            { label: "This Week", value: testResults.filter(r => new Date(r.recordedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, color: "purple", icon: <Calendar className="w-6 h-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}