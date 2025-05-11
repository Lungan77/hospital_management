import mongoose from "mongoose";

const SampleSchema = new mongoose.Schema({
  testOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestOrder",
    required: true,
  },
  testIndex: { type: Number, required: true }, // index of test inside the order
  barcode: { type: String, required: true },
  sampleType: { type: String, required: true },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectionTime: { type: Date, default: Date.now },
  notes: { type: String },
});

export default mongoose.models.Sample || mongoose.model("Sample", SampleSchema);
