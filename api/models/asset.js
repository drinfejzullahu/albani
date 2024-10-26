import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  },
  assetType: {
    type: String,
    required: true,
  },
  period: { type: String },
  quantity: { type: Number, required: true }, // hectares, number of animals, etc.
  proofDocument: { type: String }, // optional

  createdAt: { type: Date, default: Date.now },
});

const Asset = mongoose.model("Asset", AssetSchema);

export default Asset;
