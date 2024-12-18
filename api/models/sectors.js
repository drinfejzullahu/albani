import mongoose from "mongoose";

const BujqesiSchema = new mongoose.Schema({
  name: { type: String, default: "Bujqesi" },
  createdAt: { type: Date, default: Date.now },
});

const BlegtoriSchema = new mongoose.Schema({
  name: { type: String, default: "Blegtori" },
  createdAt: { type: Date, default: Date.now },
});

const PemetariSchema = new mongoose.Schema({
  name: { type: String, default: "Pemetari" },
  createdAt: { type: Date, default: Date.now },
});

const ProdhimBimorSchema = new mongoose.Schema({
  name: { type: String, default: "Prodhim Bimor" },
  createdAt: { type: Date, default: Date.now },
});

const AgroBiznesFamiljarSchema = new mongoose.Schema({
  name: { type: String, default: "AgroBiznesFamiljar" },
  createdAt: { type: Date, default: Date.now },
});

const BletariSchema = new mongoose.Schema({
  name: { type: String, default: "Bletari" },
  createdAt: { type: Date, default: Date.now },
});

const ShpeztariSchema = new mongoose.Schema({
  name: { type: String, default: "Shpeztari" },
  createdAt: { type: Date, default: Date.now },
});

// Exporting the sector models
const Bujqesi = mongoose.model("Bujqesi", BujqesiSchema);
const Blegtori = mongoose.model("Blegtori", BlegtoriSchema);
const Pemetari = mongoose.model("Pemetari", PemetariSchema);
const ProdhimBimor = mongoose.model("ProdhimBimor", ProdhimBimorSchema);
const AgroBiznesFamiljar = mongoose.model(
  "AgroBiznesFamiljar",
  AgroBiznesFamiljarSchema
);
const Bletari = mongoose.model("Bletari", BletariSchema);
const Shpeztari = mongoose.model("Shpeztari", ShpeztariSchema);

export {
  Bujqesi,
  Blegtori,
  Pemetari,
  ProdhimBimor,
  AgroBiznesFamiljar,
  Bletari,
  Shpeztari,
};
