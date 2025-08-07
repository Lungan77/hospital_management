import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { generateIncidentNumber } from "@/lib/generateIncidentNumber";

export async function POST(req) {
  try {
    await connectDB();
    const emergencyData = await req.json();

    let incidentNumber;
    let emergency;
    let maxRetries = 5;
    let attempt = 0;

    // Retry in case of duplicate incidentNumber
    while (attempt < maxRetries) {
      try {
        incidentNumber = generateIncidentNumber();
        emergency = await Emergency.create({
          ...emergencyData,
          incidentNumber,
          reportedAt: new Date()
        });
        break; // exit loop if successful
      } catch (error) {
        if (
          error.name === "MongoServerError" &&
          error.code === 11000 &&
          error.keyPattern?.incidentNumber
        ) {
          // Duplicate incidentNumber — retry
          attempt++;
        } else {
          throw error;
        }
      }
    }

    if (!emergency) {
      return NextResponse.json({
        error: "Failed to generate a unique incident number after multiple attempts"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Emergency reported successfully",
      emergency: {
        _id: emergency._id,
        incidentNumber: emergency.incidentNumber
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating emergency report:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
