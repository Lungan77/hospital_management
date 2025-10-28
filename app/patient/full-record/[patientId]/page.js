"use client";
import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import withAuth from "@/hoc/withAuth";
import {
  FileText,
  Download,
  Calendar,
  User,
  Heart,
  Pill,
  Activity,
  Stethoscope,
  ClipboardList,
  TestTube,
  ArrowLeft,
  Printer,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

function FullPatientRecordPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();
  const printRef = useRef();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFullRecord();
  }, [patientId]);

  const fetchFullRecord = async () => {
    try {
      const res = await fetch(`/api/patients/full-record/${patientId}`);
      const data = await res.json();

      if (res.ok) {
        setRecord(data.record);
      } else {
        setError(data.error || "Failed to fetch patient record");
      }
    } catch (error) {
      console.error("Error fetching full record:", error);
      setError("Error loading patient record");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Patient_Record_${record?.patient?.admissionNumber || patientId}`,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{error || "Record not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { patient, dailyAssessments, treatmentPlans, medications, procedures, vitals, dischargeSummary, testOrders, testResults } = record;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Complete Patient Record</h1>
                <p className="text-gray-600 text-xl">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-colors shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Print PDF
              </button>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </div>

        <div ref={printRef} className="print-content">
          <div className="print-header">
            <h1 className="text-4xl font-bold text-center mb-2">Complete Patient Medical Record</h1>
            <p className="text-center text-gray-600 mb-6">Generated on {new Date().toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Patient Information</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-semibold mb-1">Full Name</p>
                <p className="text-lg font-bold text-blue-900">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 font-semibold mb-1">Admission Number</p>
                <p className="text-lg font-bold text-green-900">{patient.admissionNumber}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-semibold mb-1">Patient ID</p>
                <p className="text-lg font-bold text-purple-900">{patient.patientId}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 font-semibold mb-1">Date of Birth</p>
                <p className="text-lg font-bold text-orange-900">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600 font-semibold mb-1">Gender</p>
                <p className="text-lg font-bold text-red-900">{patient.gender || "N/A"}</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-sm text-teal-600 font-semibold mb-1">Blood Type</p>
                <p className="text-lg font-bold text-teal-900">{patient.bloodType || "N/A"}</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-4">
                <p className="text-sm text-cyan-600 font-semibold mb-1">Admission Date</p>
                <p className="text-lg font-bold text-cyan-900">
                  {new Date(patient.arrivalTime).toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-600 font-semibold mb-1">Status</p>
                <p className="text-lg font-bold text-yellow-900">{patient.status}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-sm text-pink-600 font-semibold mb-1">Ward/Bed</p>
                <p className="text-lg font-bold text-pink-900">
                  {patient.assignedWard} - {patient.assignedBed || "N/A"}
                </p>
              </div>
            </div>

            {patient.chiefComplaint && (
              <div className="mt-6 p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <p className="text-sm text-red-600 font-semibold mb-2">Chief Complaint</p>
                <p className="text-lg text-red-900">{patient.chiefComplaint}</p>
              </div>
            )}

            {patient.presentingSymptoms && (
              <div className="mt-4 p-6 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                <p className="text-sm text-orange-600 font-semibold mb-2">Presenting Symptoms</p>
                <p className="text-lg text-orange-900">{patient.presentingSymptoms}</p>
              </div>
            )}

            {patient.medicalHistory && (
              <div className="mt-4 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-sm text-blue-600 font-semibold mb-2">Medical History</p>
                <p className="text-lg text-blue-900">{patient.medicalHistory}</p>
              </div>
            )}

            {patient.allergies && (
              <div className="mt-4 p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <p className="text-sm text-red-600 font-semibold mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(patient.allergies) ? (
                    patient.allergies.map((allergy, i) => (
                      <span key={i} className="bg-red-200 text-red-800 px-3 py-1 rounded-full font-semibold">
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full font-semibold">
                      {patient.allergies}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {dailyAssessments && dailyAssessments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <Stethoscope className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Daily Assessments</h2>
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  {dailyAssessments.length} assessments
                </span>
              </div>

              <div className="space-y-6">
                {dailyAssessments.map((assessment) => (
                  <div key={assessment._id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(assessment.assessmentDate).toLocaleDateString()} at{" "}
                          {new Date(assessment.assessmentDate).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Assessed by: {assessment.assessorName} ({assessment.assessorRole})
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full font-semibold ${
                          assessment.generalCondition === "Improving"
                            ? "bg-green-100 text-green-700"
                            : assessment.generalCondition === "Stable"
                            ? "bg-blue-100 text-blue-700"
                            : assessment.generalCondition === "Deteriorating"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {assessment.generalCondition}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {assessment.vitalSigns?.bloodPressure && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Blood Pressure</p>
                          <p className="text-lg font-bold text-blue-900">{assessment.vitalSigns.bloodPressure}</p>
                        </div>
                      )}
                      {assessment.vitalSigns?.heartRate && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs text-red-600 font-semibold mb-1">Heart Rate</p>
                          <p className="text-lg font-bold text-red-900">{assessment.vitalSigns.heartRate} bpm</p>
                        </div>
                      )}
                      {assessment.vitalSigns?.temperature && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-orange-600 font-semibold mb-1">Temperature</p>
                          <p className="text-lg font-bold text-orange-900">{assessment.vitalSigns.temperature}°C</p>
                        </div>
                      )}
                      {assessment.vitalSigns?.oxygenSaturation && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-semibold mb-1">SpO2</p>
                          <p className="text-lg font-bold text-green-900">{assessment.vitalSigns.oxygenSaturation}%</p>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Consciousness</p>
                        <p className="text-sm font-bold text-gray-900">{assessment.consciousness}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Pain Level</p>
                        <p className="text-sm font-bold text-gray-900">{assessment.painLevel}/10</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-semibold mb-1">Mobility</p>
                        <p className="text-sm font-bold text-gray-900">{assessment.mobilityStatus}</p>
                      </div>
                    </div>

                    {assessment.progressNotes && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-blue-600 font-semibold mb-2">Progress Notes</p>
                        <p className="text-sm text-blue-900">{assessment.progressNotes}</p>
                      </div>
                    )}

                    {assessment.treatmentResponse && (
                      <div className="bg-green-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-green-600 font-semibold mb-2">Treatment Response</p>
                        <p className="text-sm text-green-900">{assessment.treatmentResponse}</p>
                      </div>
                    )}

                    {assessment.planForNextDay && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-semibold mb-2">Plan for Next Day</p>
                        <p className="text-sm text-purple-900">{assessment.planForNextDay}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {treatmentPlans && treatmentPlans.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Treatment Plans</h2>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  {treatmentPlans.length} plans
                </span>
              </div>

              <div className="space-y-6">
                {treatmentPlans.map((plan) => (
                  <div key={plan._id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          Created: {new Date(plan.createdAt).toLocaleString()}
                        </p>
                        {plan.doctorId && (
                          <p className="text-sm text-gray-600 mt-1">
                            By: Dr. {plan.doctorId.firstName} {plan.doctorId.lastName}
                          </p>
                        )}
                      </div>
                      <span className={`px-4 py-2 rounded-full font-semibold ${
                        plan.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {plan.status}
                      </span>
                    </div>

                    {plan.primaryDiagnosis && (
                      <div className="bg-red-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-600 font-semibold mb-1">Primary Diagnosis</p>
                        <p className="text-base text-red-900">{plan.primaryDiagnosis}</p>
                      </div>
                    )}

                    {plan.treatmentGoals && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-600 font-semibold mb-1">Treatment Goals</p>
                        <p className="text-base text-blue-900">{plan.treatmentGoals}</p>
                      </div>
                    )}

                    {plan.medications && plan.medications.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Medications</p>
                        <div className="space-y-2">
                          {plan.medications.map((med, i) => (
                            <div key={i} className="bg-green-50 rounded-lg p-3">
                              <p className="font-semibold text-green-900">{med.name}</p>
                              <p className="text-sm text-green-700">{med.dosage} - {med.frequency} ({med.route})</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.procedures && plan.procedures.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Procedures</p>
                        <div className="space-y-2">
                          {plan.procedures.map((proc, i) => (
                            <div key={i} className="bg-purple-50 rounded-lg p-3">
                              <p className="font-semibold text-purple-900">{proc.name}</p>
                              <p className="text-sm text-purple-700">{proc.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.expectedDuration && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-sm text-orange-600 font-semibold mb-1">Expected Duration</p>
                        <p className="text-base text-orange-900">{plan.expectedDuration}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {medications && medications.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <Pill className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Medications</h2>
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  {medications.length} medications
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {medications.map((med) => (
                  <div key={med._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{med.medicationName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        med.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {med.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700"><strong>Dosage:</strong> {med.dosage}</p>
                      <p className="text-gray-700"><strong>Route:</strong> {med.route}</p>
                      <p className="text-gray-700"><strong>Frequency:</strong> {med.frequency}</p>
                      {med.duration && <p className="text-gray-700"><strong>Duration:</strong> {med.duration}</p>}
                      {med.indication && (
                        <p className="text-gray-700"><strong>Indication:</strong> {med.indication}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {procedures && procedures.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold text-gray-900">Procedures</h2>
                <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                  {procedures.length} procedures
                </span>
              </div>

              <div className="space-y-4">
                {procedures.map((proc) => (
                  <div key={proc._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{proc.procedureName}</h3>
                        <p className="text-sm text-gray-600">{proc.procedureType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        proc.status === "Completed" ? "bg-green-100 text-green-700" :
                        proc.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {proc.status}
                      </span>
                    </div>
                    {proc.description && (
                      <p className="text-sm text-gray-700 mb-2">{proc.description}</p>
                    )}
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      {proc.scheduledDate && (
                        <p className="text-gray-700">
                          <strong>Scheduled:</strong> {new Date(proc.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                      {proc.priority && (
                        <p className="text-gray-700"><strong>Priority:</strong> {proc.priority}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vitals && vitals.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-red-600" />
                <h2 className="text-3xl font-bold text-gray-900">Vital Signs History</h2>
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                  {vitals.length} records
                </span>
              </div>

              <div className="space-y-3">
                {vitals.slice(0, 10).map((vital) => (
                  <div key={vital._id} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      {new Date(vital.timestamp).toLocaleString()}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {vital.bloodPressure && (
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-blue-600 font-semibold">BP</p>
                          <p className="text-sm font-bold text-blue-900">{vital.bloodPressure}</p>
                        </div>
                      )}
                      {vital.heartRate && (
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-red-600 font-semibold">HR</p>
                          <p className="text-sm font-bold text-red-900">{vital.heartRate}</p>
                        </div>
                      )}
                      {vital.temperature && (
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-orange-600 font-semibold">Temp</p>
                          <p className="text-sm font-bold text-orange-900">{vital.temperature}</p>
                        </div>
                      )}
                      {vital.respiratoryRate && (
                        <div className="bg-cyan-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-cyan-600 font-semibold">RR</p>
                          <p className="text-sm font-bold text-cyan-900">{vital.respiratoryRate}</p>
                        </div>
                      )}
                      {vital.oxygenSaturation && (
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-green-600 font-semibold">SpO2</p>
                          <p className="text-sm font-bold text-green-900">{vital.oxygenSaturation}</p>
                        </div>
                      )}
                      {vital.weight && (
                        <div className="bg-purple-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-purple-600 font-semibold">Weight</p>
                          <p className="text-sm font-bold text-purple-900">{vital.weight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testOrders && testOrders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <TestTube className="w-8 h-8 text-cyan-600" />
                <h2 className="text-3xl font-bold text-gray-900">Laboratory Tests</h2>
                <span className="ml-2 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-semibold">
                  {testOrders.length} tests
                </span>
              </div>

              <div className="space-y-4">
                {testOrders.map((test) => (
                  <div key={test._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{test.testName}</h3>
                        <p className="text-sm text-gray-600">{test.testType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        test.status === "Completed" ? "bg-green-100 text-green-700" :
                        test.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {test.status}
                      </span>
                    </div>
                    {test.clinicalIndication && (
                      <p className="text-sm text-gray-700 mb-2">{test.clinicalIndication}</p>
                    )}
                    <p className="text-xs text-gray-600">
                      Ordered: {new Date(test.createdAt).toLocaleDateString()}
                      {test.orderedBy && ` by ${test.orderedBy.firstName} ${test.orderedBy.lastName}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults && testResults.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Test Results</h2>
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  {testResults.length} results
                </span>
              </div>

              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{result.testName}</h3>
                        <p className="text-sm text-gray-600">
                          Result Date: {new Date(result.resultDate).toLocaleDateString()}
                        </p>
                      </div>
                      {result.approved && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          Approved
                        </span>
                      )}
                    </div>
                    {result.results && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{result.results}</p>
                      </div>
                    )}
                    {result.interpretation && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 font-semibold mb-1">Interpretation</p>
                        <p className="text-sm text-blue-900">{result.interpretation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {dischargeSummary && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 page-break">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-orange-600" />
                <h2 className="text-3xl font-bold text-gray-900">Discharge Summary</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Discharge Date</p>
                    <p className="text-lg font-bold text-blue-900">
                      {new Date(dischargeSummary.dischargeDate).toLocaleString()}
                    </p>
                  </div>
                  {dischargeSummary.dischargedBy && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-semibold mb-1">Discharged By</p>
                      <p className="text-lg font-bold text-green-900">
                        Dr. {dischargeSummary.dischargedBy.firstName} {dischargeSummary.dischargedBy.lastName}
                      </p>
                    </div>
                  )}
                </div>

                {dischargeSummary.finalDiagnosis && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-semibold mb-2">Final Diagnosis</p>
                    <p className="text-base text-red-900">{dischargeSummary.finalDiagnosis}</p>
                  </div>
                )}

                {dischargeSummary.treatmentSummary && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Treatment Summary</p>
                    <p className="text-base text-blue-900">{dischargeSummary.treatmentSummary}</p>
                  </div>
                )}

                {dischargeSummary.dischargeMedications && dischargeSummary.dischargeMedications.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold mb-2">Discharge Medications</p>
                    <div className="space-y-2">
                      {dischargeSummary.dischargeMedications.map((med, i) => (
                        <p key={i} className="text-base text-green-900">• {med}</p>
                      ))}
                    </div>
                  </div>
                )}

                {dischargeSummary.followUpInstructions && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-semibold mb-2">Follow-up Instructions</p>
                    <p className="text-base text-purple-900">{dischargeSummary.followUpInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="print-footer text-center text-gray-600 text-sm mt-8 pt-6 border-t border-gray-200">
            <p>End of Patient Medical Record</p>
            <p>This document is confidential and contains sensitive medical information</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .print-content {
            max-width: 100%;
            padding: 20px;
          }
          .print-header {
            margin-bottom: 30px;
          }
          .print-footer {
            margin-top: 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(FullPatientRecordPage, ["doctor", "nurse", "er", "admin", "receptionist"]);
