import mongoose from "mongoose";

const SampleSchema = new mongoose.Schema({
  testOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestOrder",
    required: true,
  },
  testIndex: { type: Number, required: true },
  barcode: { type: String, required: true },
  sampleType: { type: String, required: true },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectionTime: { type: Date, default: Date.now },
  notes: { type: String },

  status: { type: String, default: "Collected" },

  storage: {
    currentLocation: {
      unit: String, // e.g. Freezer 2
      shelf: String, // e.g. Shelf A
    },
    history: [
      {
        unit: String,
        shelf: String,
        storedAt: Date,
        storedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
});

export default mongoose.models.Sample || mongoose.model("Sample", SampleSchema);