"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { useRouter } from "next/navigation";
import { FlaskConical, User, Calendar, Clock, Stethoscope, AlertCircle, CheckCircle, Search, Filter, Plus } from "lucide-react";

function RegisterSamples() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/tests/all");
    const data = await res.json();
    if (res.ok) {
      const pending = data.orders.map((o) => ({
        ...o,
        tests: o.tests.map((t, idx) => ({ ...t, testIndex: idx })),
      })).filter(o => o.tests.some(t => t.status === "Pending Sample Collection"));
      setOrders(pending);
    } else {
      setMessage(data.error);
    }
    setLoading(false);
  };

  const registerSample = async (orderId) => {
    router.push(`/tests/collect/${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.appointmentId?.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.appointmentId?.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === "" || 
                           order.tests.some(test => test.priority === priorityFilter);
    
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      "STAT": "bg-red-100 text-red-700 border-red-200",
      "Urgent": "bg-orange-100 text-orange-700 border-orange-200",
      "Routine": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading test orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FlaskConical className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Sample Collection</h1>
                <p className="text-gray-600 text-xl">Register and manage test samples for laboratory processing</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{orders.length}</div>
                <div className="text-sm text-purple-600">Pending Orders</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {orders.filter(o => o.tests.some(t => t.priority === "STAT")).length}
                </div>
                <div className="text-sm text-red-600">STAT Orders</div>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.tests.some(t => t.priority === "Urgent")).length}
                </div>
                <div className="text-sm text-orange-600">Urgent Orders</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.tests.some(t => t.priority === "Routine")).length}
                </div>
                <div className="text-sm text-green-600">Routine Orders</div>
              </div>
            </div>
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
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="">All Priorities</option>
                  <option value="STAT">STAT</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-r-2xl shadow-lg">
            <p className="text-green-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FlaskConical className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Pending Collections</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || priorityFilter ? "No orders match your current filters." : "No tests are awaiting sample collection."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 group">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      <FlaskConical className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Order Collection</h2>
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <span>{new Date(order.appointmentId?.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-green-500" />
                          <span>{order.appointmentId?.patientId?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-purple-500" />
                          <span>{order.appointmentId?.doctorId?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => registerSample(order._id)}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                  >
                    <Plus className="w-6 h-6" />
                    Collect Samples
                  </button>
                </div>

                {/* Tests List */}
                <div className="grid gap-4">
                  {order.tests
                    .filter((test) => test.status === "Pending Sample Collection")
                    .map((test) => (
                      <div key={test.testIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 transition-all duration-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">{test.name}</h3>
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(test.priority)}`}>
                                {test.priority === "STAT" && <AlertCircle className="w-4 h-4" />}
                                {test.priority === "Urgent" && <Clock className="w-4 h-4" />}
                                {test.priority === "Routine" && <CheckCircle className="w-4 h-4" />}
                                {test.priority}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 font-medium">Sample Type</p>
                                <p className="text-gray-900 font-semibold">{test.sampleType}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Instructions</p>
                                <p className="text-gray-900">{test.instructions}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Reason</p>
                                <p className="text-gray-900">{test.reason}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 font-medium">Status</p>
                                <p className="text-yellow-600 font-semibold">{test.status}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(RegisterSamples, ["labtech", "nurse"]);