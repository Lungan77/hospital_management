'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader, PlusCircle } from "lucide-react";
import withAuth from "@/hoc/withAuth";

function FeedbackPage() {
  const params = useParams();
  const resultId = params?.resultId;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;

    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/results/feedback?testResultId=${resultId}`);
        const data = await res.json();

        if (data.success) {
          setFeedbacks(data.feedback);
        } else {
          console.error("Failed to fetch feedback:", data.error);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-3 text-blue-500 font-medium">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="mt-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Feedback</h1>
          <Link
            href="/results/doctor"
            className="text-blue-600 hover:underline text-sm flex items-center mt-2"
          >
            &larr; Back to Test Results
          </Link>
        </div>
        <Link
          href={`/results/feedback/${resultId}/create`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Add Feedback
        </Link>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
          <p className="text-yellow-800">No feedback available for this result.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                  {fb.urgencyLevel}
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {fb.visibility === "private" ? "🔒 Private" : "🌐 Public"}
                </span>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-gray-700">Doctor:</span>
                <span className="text-gray-900">{fb.doctorId?.name || "Unknown"}</span>
                <span className="text-xs text-gray-500">({fb.doctorId?.email})</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Summary:</span>{" "}
                <span className="text-gray-800">{fb.summary}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Recommendations:</span>{" "}
                <span className="text-gray-800">{fb.recommendations}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Follow-up Required:</span>{" "}
                <span className="text-gray-800">{fb.followUpRequired ? "Yes" : "No"}</span>
                {fb.followUpRequired && fb.followUpDate && (
                  <span className="ml-4 font-semibold text-gray-700">Follow-up Date:</span>
                )}
                {fb.followUpRequired && fb.followUpDate && (
                  <span className="ml-1 text-gray-800">
                    {new Date(fb.followUpDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(FeedbackPage, ["doctor", "labtech"]);
