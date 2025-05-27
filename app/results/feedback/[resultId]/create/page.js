"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";

function FeedbackPage() {
  const { resultId } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    summary: "",
    recommendations: "",
    urgencyLevel: "low",
    followUpRequired: false,
    followUpDate: "",
    visibility: "patient-visible",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/results/feedback/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          testResultId: resultId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Submission failed.");
        return;
      }

      setSuccess("Feedback submitted successfully.");
      router.push(`/results/feedback/${resultId}`); // or anywhere you'd like to redirect
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Doctor Feedback for Test Result</h1>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          name="summary"
          rows="4"
          placeholder="Summary or interpretation"
          className="w-full border p-2 rounded"
          value={form.summary}
          onChange={handleChange}
          required
        />

        <textarea
          name="recommendations"
          rows="3"
          placeholder="Recommendations or follow-up"
          className="w-full border p-2 rounded"
          value={form.recommendations}
          onChange={handleChange}
        />

        <div>
          <label className="font-medium">Urgency Level:</label>
          <select
            name="urgencyLevel"
            value={form.urgencyLevel}
            onChange={handleChange}
            className="ml-2 border rounded p-1"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="followUpRequired"
            checked={form.followUpRequired}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Follow-up Required</label>
        </div>

        {form.followUpRequired && (
          <input
            type="date"
            name="followUpDate"
            value={form.followUpDate}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        )}

        <div>
          <label className="font-medium">Visibility:</label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="ml-2 border rounded p-1"
          >
            <option value="patient-visible">Visible to Patient</option>
            <option value="doctor-only">Doctor Only</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

export default withAuth(FeedbackPage, ["doctor"]);
