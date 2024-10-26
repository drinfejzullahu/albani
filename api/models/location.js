import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  location: { type: String, required: true },
});

const Location = mongoose.model("Location", LocationSchema);

export default Location;
