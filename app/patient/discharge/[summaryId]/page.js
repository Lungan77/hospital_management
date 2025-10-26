"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  FileText,
  Download,
  Calendar,
  Pill,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Home,
  Activity,
  AlertCircle,
  Heart,
  Utensils,
  Star,
  ThumbsUp,
  Send,
  Printer
} from "lucide-react";

function DischargeDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { summaryId } = unwrappedParams;
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [admission, setAdmission] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [followUpAppointments, setFollowUpAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [feedback, setFeedback] = useState({
    dischargeSummaryId: summaryId,
    overallExperience: 0,
    treatmentQuality: 0,
    staffProfessionalism: 0,
    facilityCleaniness: 0,
    communicationClarity: 0,
    dischargeInstructions: 0,
    wouldRecommend: true,
    comments: "",
    concerns: "",
    suggestions: "",
    followUpNeeded: false,
    contactForFollowUp: false
  });

  useEffect(() => {
    if (summaryId) {
      fetchDischargeDetails();
    }
  }, [summaryId]);

  const fetchDischargeDetails = async () => {
    try {
      const res = await fetch(`/api/discharge/patient?summaryId=${summaryId}`);
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setAdmission(data.admission);
        setPrescriptions(data.prescriptions || []);
        setFollowUpAppointments(data.followUpAppointments || []);
      }
    } catch (error) {
      console.error("Error fetching discharge details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (field, value) => {
    setFeedback({ ...feedback, [field]: value });
  };

  const handleSubmitFeedback = async () => {
    if (feedback.overallExperience === 0 || feedback.treatmentQuality === 0 ||
        feedback.staffProfessionalism === 0 || feedback.facilityCleaniness === 0 ||
        feedback.communicationClarity === 0 || feedback.dischargeInstructions === 0) {
      setFeedbackMessage("Please rate all categories");
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackMessage("");

    try {
      const res = await fetch("/api/discharge/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });

      const data = await res.json();

      if (res.ok) {
        setFeedbackMessage("Thank you for your feedback!");
        setShowFeedback(false);
        setTimeout(() => {
          router.push("/patient/discharge");
        }, 2000);
      } else {
        setFeedbackMessage(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      setFeedbackMessage("Error submitting feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const downloadPDF = () => {
    if (!summary || !admission) return;

    import('jspdf').then((module) => {
      const jsPDF = module.default;
      const doc = new jsPDF();

      let yPos = 20;
      const lineHeight = 7;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('DISCHARGE SUMMARY', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const addSection = (title, content) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont(undefined, 'bold');
        doc.text(title, margin, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        if (typeof content === 'string' && content) {
          const lines = doc.splitTextToSize(content, contentWidth);
          lines.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
          });
        }
        yPos += 3;
      };

      addSection('Patient Name:', `${admission.firstName} ${admission.lastName}`);
      addSection('Admission Number:', admission.admissionNumber);
      addSection('Discharge Date:', new Date(summary.dischargeDate).toLocaleDateString());
      addSection('Length of Stay:', `${summary.lengthOfStay} days`);
      yPos += 5;

      addSection('FINAL DIAGNOSIS:', summary.finalDiagnosis);
      addSection('HOSPITAL COURSE:', summary.hospitalCourse);
      addSection('CONDITION AT DISCHARGE:', summary.conditionAtDischarge);

      if (summary.dischargeMedications && summary.dischargeMedications.length > 0) {
        yPos += 5;
        doc.setFont(undefined, 'bold');
        doc.text('DISCHARGE MEDICATIONS:', margin, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        summary.dischargeMedications.forEach((med, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${index + 1}. ${med.medicationName} - ${med.dosage}, ${med.frequency}`, margin + 5, yPos);
          yPos += lineHeight;
          if (med.instructions) {
            const lines = doc.splitTextToSize(`   Instructions: ${med.instructions}`, contentWidth - 10);
            lines.forEach(line => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, margin + 5, yPos);
              yPos += lineHeight;
            });
          }
        });
      }

      if (summary.dietaryInstructions) {
        yPos += 5;
        addSection('DIETARY INSTRUCTIONS:', summary.dietaryInstructions);
      }

      if (summary.followUpCare && summary.followUpCare.required) {
        yPos += 5;
        doc.setFont(undefined, 'bold');
        doc.text('FOLLOW-UP CARE:', margin, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        if (summary.followUpCare.appointmentDate) {
          doc.text(`Date: ${new Date(summary.followUpCare.appointmentDate).toLocaleDateString()}`, margin + 5, yPos);
          yPos += lineHeight;
        }
      }

      doc.save(`Discharge_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-all"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading discharge summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discharge Summary Not Found</h2>
          <button
            onClick={() => router.push("/patient/discharge")}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Back to Discharges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Discharge Summary</h1>
                <p className="text-gray-600 text-lg">
                  Discharged on {new Date(summary.dischargeDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div className={`mb-6 p-4 rounded-xl ${
            feedbackMessage.includes("Thank you")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">{feedbackMessage}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-7 h-7 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                <p className="font-semibold text-gray-900">
                  {admission?.firstName} {admission?.lastName}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Admission Number</p>
                <p className="font-semibold text-gray-900">{admission?.admissionNumber}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Length of Stay</p>
                <p className="font-semibold text-gray-900">{summary.lengthOfStay} days</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Discharge Destination</p>
                <p className="font-semibold text-gray-900">{summary.dischargeDestination}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Activity className="w-7 h-7 text-blue-600" />
              Medical Summary
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Final Diagnosis</h3>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-gray-900">{summary.finalDiagnosis}</p>
                </div>
              </div>

              {summary.secondaryDiagnoses && summary.secondaryDiagnoses.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Secondary Diagnoses</h3>
                  <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-xl">
                    {summary.secondaryDiagnoses.map((diag, idx) => (
                      <li key={idx} className="text-gray-900">{diag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Hospital Course</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-900 whitespace-pre-line">{summary.hospitalCourse}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Condition at Discharge</h3>
                <div className={`p-4 rounded-xl ${
                  summary.conditionAtDischarge === "Improved" ? "bg-green-50" :
                  summary.conditionAtDischarge === "Stable" ? "bg-blue-50" :
                  "bg-yellow-50"
                }`}>
                  <p className="font-semibold text-gray-900">{summary.conditionAtDischarge}</p>
                </div>
              </div>
            </div>
          </div>

          {summary.dischargeMedications && summary.dischargeMedications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Pill className="w-7 h-7 text-blue-600" />
                Discharge Medications
              </h2>
              <div className="space-y-4">
                {summary.dischargeMedications.map((med, idx) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-2">{med.medicationName}</h4>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Dosage:</span>
                        <span className="ml-2 font-semibold text-gray-900">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 font-semibold text-gray-900">{med.frequency}</span>
                      </div>
                      {med.duration && (
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="ml-2 font-semibold text-gray-900">{med.duration}</span>
                        </div>
                      )}
                    </div>
                    {med.instructions && (
                      <p className="mt-3 text-gray-700 bg-white p-3 rounded-lg">
                        <span className="font-semibold">Instructions:</span> {med.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(summary.dietaryInstructions || summary.activityRestrictions) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Heart className="w-7 h-7 text-red-600" />
                Care Instructions
              </h2>
              <div className="space-y-4">
                {summary.dietaryInstructions && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-green-600" />
                      Dietary Instructions
                    </h3>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-gray-900">{summary.dietaryInstructions}</p>
                    </div>
                  </div>
                )}
                {summary.activityRestrictions && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Activity Restrictions
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-gray-900">{summary.activityRestrictions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {summary.followUpCare && summary.followUpCare.required && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-purple-600" />
                Follow-Up Care
              </h2>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  {summary.followUpCare.appointmentDate && (
                    <p className="mb-2">
                      <span className="font-semibold text-gray-900">Appointment Date:</span>{" "}
                      {new Date(summary.followUpCare.appointmentDate).toLocaleDateString()}
                    </p>
                  )}
                  {summary.followUpCare.appointmentWith && (
                    <p className="mb-2">
                      <span className="font-semibold text-gray-900">Appointment With:</span>{" "}
                      {summary.followUpCare.appointmentWith}
                    </p>
                  )}
                  {summary.followUpCare.instructions && (
                    <p className="mt-3 text-gray-700">
                      <span className="font-semibold text-gray-900">Instructions:</span>{" "}
                      {summary.followUpCare.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {summary.warningSignsToReport && summary.warningSignsToReport.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-3">
                <AlertCircle className="w-7 h-7 text-red-600" />
                Warning Signs to Report
              </h2>
              <div className="bg-red-50 p-4 rounded-xl">
                <ul className="space-y-3">
                  {summary.warningSignsToReport.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {summary.patientEducation && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-600" />
                Patient Education
              </h2>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-gray-900 whitespace-pre-line">{summary.patientEducation}</p>
              </div>
            </div>
          )}
        </div>

        {!showFeedback ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Share Your Experience</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Your feedback helps us improve our services
            </p>
            <button
              onClick={() => setShowFeedback(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Provide Feedback
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Your Feedback
            </h2>

            <div className="space-y-6">
              <StarRating
                label="Overall Experience"
                value={feedback.overallExperience}
                onChange={(val) => handleRatingChange("overallExperience", val)}
              />
              <StarRating
                label="Treatment Quality"
                value={feedback.treatmentQuality}
                onChange={(val) => handleRatingChange("treatmentQuality", val)}
              />
              <StarRating
                label="Staff Professionalism"
                value={feedback.staffProfessionalism}
                onChange={(val) => handleRatingChange("staffProfessionalism", val)}
              />
              <StarRating
                label="Facility Cleanliness"
                value={feedback.facilityCleaniness}
                onChange={(val) => handleRatingChange("facilityCleaniness", val)}
              />
              <StarRating
                label="Communication Clarity"
                value={feedback.communicationClarity}
                onChange={(val) => handleRatingChange("communicationClarity", val)}
              />
              <StarRating
                label="Discharge Instructions"
                value={feedback.dischargeInstructions}
                onChange={(val) => handleRatingChange("dischargeInstructions", val)}
              />

              <div>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback({ ...feedback, wouldRecommend: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <span className="text-gray-900 font-semibold">I would recommend this hospital</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your positive experiences..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Concerns or Issues
                </label>
                <textarea
                  value={feedback.concerns}
                  onChange={(e) => setFeedback({ ...feedback, concerns: e.target.value })}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share any concerns or issues you experienced..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Suggestions for Improvement
                </label>
                <textarea
                  value={feedback.suggestions}
                  onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we improve our services?"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={submittingFeedback}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-lg"
                >
                  <Send className="w-5 h-5" />
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(DischargeDetailPage, ["patient"]);
