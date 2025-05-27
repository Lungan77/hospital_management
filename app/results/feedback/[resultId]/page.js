'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";
import withAuth from "@/hoc/withAuth";

function FeedbackPage() {
  const { resultId } = useParams();
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
      <div className="flex justify-start items-start min-h-screen px-4 pt-10">
        <Loader className="animate-spin h-8 w-8 text-gray-500" />
        <span className="ml-3 text-gray-500">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="mt-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-left">Doctor Feedback</h1>

      {feedbacks.length === 0 ? (
        <p className="text-gray-600 text-left">No feedback available for this result.</p>
      ) : (
        <div className="space-y-6">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="p-6 border border-gray-200 rounded-xl shadow bg-gray-50 hover:shadow-md transition"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-gray-700">Doctor:</span>
                <span className="text-gray-900">{fb.doctorId?.name || "Unknown"}</span>
                <span className="text-xs text-gray-500">({fb.doctorId?.email})</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Summary:</span>{" "}
                <span className="text-gray-800">{fb.summary}</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Recommendations:</span>{" "}
                <span className="text-gray-800">{fb.recommendations}</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Urgency Level:</span>{" "}
                <span className="text-gray-800">{fb.urgencyLevel}</span>
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Follow-up Required:</span>{" "}
                <span className="text-gray-800">{fb.followUpRequired ? "Yes" : "No"}</span>
              </div>
              {fb.followUpRequired && (
                <div className="mb-1">
                  <span className="font-semibold text-gray-700">Follow-up Date:</span>{" "}
                  <span className="text-gray-800">
                    {new Date(fb.followUpDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-3">
                Visibility: {fb.visibility} | Created:{" "}
                {new Date(fb.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(FeedbackPage, ["doctor", "admin"]);
