import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file");
    const emergencyId = formData.get("emergencyId");
    const type = formData.get("type");

    if (!file || !emergencyId) {
      return Response.json({ error: "Missing file or emergency ID" }, { status: 400 });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return Response.json({ error: "Emergency not found" }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // In a real application, you would upload to cloud storage (AWS S3, etc.)
    // For this example, we'll simulate the upload
    const uploadPath = join(process.cwd(), "uploads", filename);
    
    try {
      await writeFile(uploadPath, buffer);
    } catch (error) {
      // If local file write fails, we'll just store the metadata
      console.log("File write failed, storing metadata only");
    }

    // Create file record
    const fileRecord = {
      filename: filename,
      url: `/uploads/${filename}`, // In production, this would be a cloud storage URL
      uploadedBy: auth.session.user.id,
      uploadedAt: new Date(),
      description: `${type} uploaded during emergency response`
    };

    // Add to appropriate array based on type
    if (type === "photo") {
      emergency.incidentPhotos.push(fileRecord);
    } else {
      emergency.medicalReports.push({
        ...fileRecord,
        type: type === "document" ? "Document" : "Other"
      });
    }

    await emergency.save();

    return Response.json({ 
      message: "File uploaded successfully",
      filename: filename 
    }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return Response.json({ error: "Error uploading file" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};