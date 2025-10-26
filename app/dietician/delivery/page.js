"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Utensils,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";

function MealDeliveryPage() {
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalDelivered: 0,
    deliveryRate: 0
  });

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/meal-plans?date=${today}&status=Active`);
      const data = await res.json();
      if (res.ok) {
        const plans = data.mealPlans || [];
        setMealPlans(plans);
        calculateStats(plans);
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (plans) => {
    let totalPending = 0;
    let totalDelivered = 0;

    plans.forEach((plan) => {
      if (!plan.meals.breakfast?.delivered) totalPending++;
      else totalDelivered++;

      if (!plan.meals.lunch?.delivered) totalPending++;
      else totalDelivered++;

      if (!plan.meals.dinner?.delivered) totalPending++;
      else totalDelivered++;
    });

    const total = totalPending + totalDelivered;
    const rate = total > 0 ? ((totalDelivered / total) * 100).toFixed(1) : 0;

    setStats({ totalPending, totalDelivered, deliveryRate: rate });
  };

  const getMealStatus = (meal) => {
    if (!meal) return null;

    if (meal.delivered) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Delivered",
        color: "bg-green-100 text-green-700 border-green-200"
      };
    }

    const now = new Date();
    const mealTime = meal.time ? new Date(`${new Date().toDateString()} ${meal.time}`) : null;

    if (mealTime && now > mealTime) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: "Overdue",
        color: "bg-red-100 text-red-700 border-red-200"
      };
    }

    return {
      icon: <Clock className="w-4 h-4" />,
      text: "Pending",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading delivery status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Meal Delivery Tracking</h1>
              <p className="text-gray-600 text-xl">Monitor today&apos;s meal delivery status</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalPending}</div>
                <div className="text-yellow-100 text-sm">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalDelivered}</div>
                <div className="text-green-100 text-sm">Delivered</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.deliveryRate}%</div>
                <div className="text-blue-100 text-sm">Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Meal Plans</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {mealPlans.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No active meal plans for today</p>
            </div>
          ) : (
            <div className="space-y-6">
              {mealPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {plan.patientName?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{plan.patientName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Admission: {plan.admissionNumber}</span>
                        <span>•</span>
                        <span>Diet: {plan.dietType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">Breakfast</h4>
                        {getMealStatus(plan.meals.breakfast) && (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                            getMealStatus(plan.meals.breakfast).color
                          }`}>
                            {getMealStatus(plan.meals.breakfast).icon}
                            {getMealStatus(plan.meals.breakfast).text}
                          </span>
                        )}
                      </div>
                      {plan.meals.breakfast?.time && (
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {plan.meals.breakfast.time}
                        </p>
                      )}
                      {plan.meals.breakfast?.items && (
                        <ul className="text-sm text-gray-700 space-y-1">
                          {plan.meals.breakfast.items.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      )}
                      {plan.meals.breakfast?.delivered && plan.meals.breakfast.deliveredBy && (
                        <p className="text-xs text-green-600 mt-2">
                          <User className="w-3 h-3 inline mr-1" />
                          By: {plan.meals.breakfast.deliveredBy}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">Lunch</h4>
                        {getMealStatus(plan.meals.lunch) && (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                            getMealStatus(plan.meals.lunch).color
                          }`}>
                            {getMealStatus(plan.meals.lunch).icon}
                            {getMealStatus(plan.meals.lunch).text}
                          </span>
                        )}
                      </div>
                      {plan.meals.lunch?.time && (
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {plan.meals.lunch.time}
                        </p>
                      )}
                      {plan.meals.lunch?.items && (
                        <ul className="text-sm text-gray-700 space-y-1">
                          {plan.meals.lunch.items.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      )}
                      {plan.meals.lunch?.delivered && plan.meals.lunch.deliveredBy && (
                        <p className="text-xs text-green-600 mt-2">
                          <User className="w-3 h-3 inline mr-1" />
                          By: {plan.meals.lunch.deliveredBy}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">Dinner</h4>
                        {getMealStatus(plan.meals.dinner) && (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${
                            getMealStatus(plan.meals.dinner).color
                          }`}>
                            {getMealStatus(plan.meals.dinner).icon}
                            {getMealStatus(plan.meals.dinner).text}
                          </span>
                        )}
                      </div>
                      {plan.meals.dinner?.time && (
                        <p className="text-sm text-gray-600 mb-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {plan.meals.dinner.time}
                        </p>
                      )}
                      {plan.meals.dinner?.items && (
                        <ul className="text-sm text-gray-700 space-y-1">
                          {plan.meals.dinner.items.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      )}
                      {plan.meals.dinner?.delivered && plan.meals.dinner.deliveredBy && (
                        <p className="text-xs text-green-600 mt-2">
                          <User className="w-3 h-3 inline mr-1" />
                          By: {plan.meals.dinner.deliveredBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {plan.assistanceRequired && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Assistance Required:</span> {plan.assistanceLevel}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(MealDeliveryPage, ["dietician", "nurse", "admin"]);
