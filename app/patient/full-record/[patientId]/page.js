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
            <div className="border-b-4 border-blue-900 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-blue-900 mb-1">MEDICAL RECORD</h1>
                  <p className="text-lg text-gray-700 font-semibold">Complete Patient Documentation</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-semibold">Document ID</p>
                  <p className="text-lg font-bold text-blue-900">{patient.admissionNumber}</p>
                  <p className="text-xs text-gray-500 mt-2">Generated: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="medical-section mb-8">
            <div className="section-header">
              <h2 className="section-title">I. PATIENT DEMOGRAPHICS</h2>
            </div>
            <div className="section-content">
              <table className="info-table">
                <tbody>
                  <tr>
                    <td className="label-cell">Full Name:</td>
                    <td className="value-cell font-bold">{patient.firstName} {patient.lastName}</td>
                    <td className="label-cell">Patient ID:</td>
                    <td className="value-cell">{patient.patientId}</td>
                  </tr>
                  <tr>
                    <td className="label-cell">Admission Number:</td>
                    <td className="value-cell font-bold">{patient.admissionNumber}</td>
                    <td className="label-cell">Date of Birth:</td>
                    <td className="value-cell">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-cell">Gender:</td>
                    <td className="value-cell">{patient.gender || "N/A"}</td>
                    <td className="label-cell">Blood Type:</td>
                    <td className="value-cell font-bold text-red-700">{patient.bloodType || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="label-cell">Admission Date:</td>
                    <td className="value-cell">{new Date(patient.arrivalTime).toLocaleString()}</td>
                    <td className="label-cell">Current Status:</td>
                    <td className="value-cell font-semibold">{patient.status}</td>
                  </tr>
                  <tr>
                    <td className="label-cell">Ward Assignment:</td>
                    <td className="value-cell">{patient.assignedWard}</td>
                    <td className="label-cell">Bed Number:</td>
                    <td className="value-cell">{patient.assignedBed || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="medical-section mb-8">
            <div className="section-header">
              <h2 className="section-title">II. CLINICAL PRESENTATION</h2>
            </div>
            <div className="section-content space-y-4">
              {patient.chiefComplaint && (
                <div className="clinical-note">
                  <p className="clinical-label">Chief Complaint:</p>
                  <p className="clinical-value">{patient.chiefComplaint}</p>
                </div>
              )}

              {patient.presentingSymptoms && (
                <div className="clinical-note">
                  <p className="clinical-label">Presenting Symptoms:</p>
                  <p className="clinical-value">{patient.presentingSymptoms}</p>
                </div>
              )}

              {patient.medicalHistory && (
                <div className="clinical-note">
                  <p className="clinical-label">Medical History:</p>
                  <p className="clinical-value">{patient.medicalHistory}</p>
                </div>
              )}

              {patient.allergies && (
                <div className="clinical-note alert-box">
                  <p className="clinical-label text-red-700">⚠ ALLERGIES:</p>
                  <p className="clinical-value font-bold text-red-800">
                    {Array.isArray(patient.allergies)
                      ? patient.allergies.join(", ")
                      : patient.allergies}
                  </p>
                </div>
              )}
            </div>
          </div>

          {dailyAssessments && dailyAssessments.length > 0 && (
            <div className="medical-section mb-8 page-break">
              <div className="section-header">
                <h2 className="section-title">III. DAILY CLINICAL ASSESSMENTS ({dailyAssessments.length})</h2>
              </div>
              <div className="section-content">

              <div className="space-y-4">
                {dailyAssessments.map((assessment, index) => (
                  <div key={assessment._id} className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-900 mb-1">
                          Assessment #{dailyAssessments.length - index}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(assessment.assessmentDate).toLocaleDateString()} at {new Date(assessment.assessmentDate).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          By: {assessment.assessorName} ({assessment.assessorRole})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 font-semibold">Condition</div>
                        <div className="font-bold text-sm">{assessment.generalCondition}</div>
                      </div>
                    </div>

                    {(assessment.vitalSigns?.bloodPressure || assessment.vitalSigns?.heartRate || assessment.vitalSigns?.temperature || assessment.vitalSigns?.oxygenSaturation) && (
                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        {assessment.vitalSigns?.bloodPressure && (
                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 font-semibold">BP</div>
                            <div className="font-bold">{assessment.vitalSigns.bloodPressure}</div>
                          </div>
                        )}
                        {assessment.vitalSigns?.heartRate && (
                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 font-semibold">HR</div>
                            <div className="font-bold">{assessment.vitalSigns.heartRate} bpm</div>
                          </div>
                        )}
                        {assessment.vitalSigns?.temperature && (
                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 font-semibold">Temp</div>
                            <div className="font-bold">{assessment.vitalSigns.temperature}°C</div>
                          </div>
                        )}
                        {assessment.vitalSigns?.oxygenSaturation && (
                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 font-semibold">SpO2</div>
                            <div className="font-bold">{assessment.vitalSigns.oxygenSaturation}%</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div><span className="font-semibold">Consciousness:</span> {assessment.consciousness}</div>
                      <div><span className="font-semibold">Pain:</span> {assessment.painLevel}/10</div>
                      <div><span className="font-semibold">Mobility:</span> {assessment.mobilityStatus}</div>
                    </div>

                    {assessment.progressNotes && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Progress Notes:</div>
                        <div className="text-sm bg-white p-2 rounded border">{assessment.progressNotes}</div>
                      </div>
                    )}

                    {assessment.treatmentResponse && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Treatment Response:</div>
                        <div className="text-sm bg-white p-2 rounded border">{assessment.treatmentResponse}</div>
                      </div>
                    )}

                    {assessment.planForNextDay && (
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">Plan for Next Day:</div>
                        <div className="text-sm bg-white p-2 rounded border">{assessment.planForNextDay}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

          {treatmentPlans && treatmentPlans.length > 0 && (
            <div className="medical-section mb-8 page-break">
              <div className="section-header">
                <h2 className="section-title">IV. TREATMENT PLANS ({treatmentPlans.length})</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {medications && medications.length > 0 && (
            <div className="medical-section mb-8">
              <div className="section-header">
                <h2 className="section-title">V. MEDICATIONS ({medications.length})</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {procedures && procedures.length > 0 && (
            <div className="medical-section mb-8">
              <div className="section-header">
                <h2 className="section-title">VI. PROCEDURES ({procedures.length})</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {vitals && vitals.length > 0 && (
            <div className="medical-section mb-8 page-break">
              <div className="section-header">
                <h2 className="section-title">VII. VITAL SIGNS HISTORY (Last 10)</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {testOrders && testOrders.length > 0 && (
            <div className="medical-section mb-8">
              <div className="section-header">
                <h2 className="section-title">VIII. LABORATORY TEST ORDERS ({testOrders.length})</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {testResults && testResults.length > 0 && (
            <div className="medical-section mb-8">
              <div className="section-header">
                <h2 className="section-title">IX. LABORATORY TEST RESULTS ({testResults.length})</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          {dischargeSummary && (
            <div className="medical-section mb-8 page-break">
              <div className="section-header">
                <h2 className="section-title">X. DISCHARGE SUMMARY</h2>
              </div>
              <div className="section-content">

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
            </div>
          )}

          <div className="print-footer">
            <div className="border-t-2 border-gray-300 pt-4 mt-12">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <div>
                  <p className="font-semibold">CONFIDENTIAL MEDICAL RECORD</p>
                  <p>This document contains protected health information</p>
                </div>
                <div className="text-right">
                  <p>Document ID: {patient.admissionNumber}</p>
                  <p>Page Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-center mt-4 text-xs text-gray-500">
                <p>This record is subject to medical confidentiality laws and regulations.</p>
                <p>Unauthorized disclosure or use is strictly prohibited.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .medical-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .section-header {
          background: linear-gradient(to right, #1e3a8a, #1e40af);
          padding: 12px 20px;
          border-bottom: 3px solid #1e40af;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .section-content {
          padding: 20px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
        }

        .info-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .label-cell {
          font-weight: 600;
          color: #374151;
          width: 20%;
          background: #f9fafb;
        }

        .value-cell {
          color: #111827;
          width: 30%;
        }

        .clinical-note {
          padding: 14px;
          background: #f9fafb;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }

        .clinical-note.alert-box {
          background: #fef2f2;
          border-left-color: #dc2626;
        }

        .clinical-label {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .clinical-value {
          font-size: 14px;
          color: #111827;
          line-height: 1.6;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .data-item {
          padding: 10px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }

        .data-item-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .data-item-value {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .page-break {
            page-break-before: always;
            break-before: page;
          }

          .print-content {
            max-width: 100%;
            padding: 30px 40px;
            margin: 0;
          }

          .print-header {
            margin-bottom: 30px;
          }

          .print-footer {
            margin-top: 40px;
            page-break-inside: avoid;
          }

          .medical-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
            border: 1px solid #000;
          }

          .section-header {
            background: #1e3a8a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .section-title {
            color: white !important;
          }

          .clinical-note.alert-box {
            background: #fef2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .info-table td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .label-cell {
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(FullPatientRecordPage, ["doctor", "nurse", "er", "admin", "receptionist"]);
