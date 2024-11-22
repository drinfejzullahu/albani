import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  units: { type: String, required: true },
  value: { type: Number, required: true },
  vat: { type: String, required: true },
});

const PersonSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  parentName: { type: String },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["m", "f"], required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  farmAddress: { type: String, required: true },
  educationLevel: {
    type: String,
    enum: ["fillore", "mesme", "larte"],
    required: true,
  },
  profession: { type: String },
  familyMembers: { type: Number },
  assets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
  ],
  // Add investments field as an array of InvestmentSchema
  investments: [InvestmentSchema],

  productsOrServices: { type: String },
  buyers: { type: String },
  expectations: { type: String },
  requests: { type: String },

  sectorType: {
    type: String,
    enum: [
      "Bujqesi",
      "Blegtori",
      "Pemetari",
      "ProdhimBimor",
      "AgroBiznesFamiljar",
      "Bletari",
      "Shpeztari",
    ],
    required: true,
  },
  sector: { type: String },
  workingLandDetails: {
    ownedLand: { type: Number }, // hectares or square meters
    rentedLand: { type: Number }, // hectares or square meters
  },
  livestockDetails: [
    {
      type: { type: String },
      number: { type: Number },
    },
  ],
  treeDetails: [
    {
      type: { type: String },
      number: { type: Number },
    },
  ],
  plantDetails: [
    {
      type: { type: String },
      number: { type: Number },
    },
  ],
  beeDetails: {
    number: { type: Number },
    type: { type: String },
  },
  birdDetails: [
    {
      number: { type: Number },
      type: { type: String },
    },
  ],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Person = mongoose.model("Person", PersonSchema);

export default Person;
