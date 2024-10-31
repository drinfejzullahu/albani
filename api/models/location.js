import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  location: { type: String, required: true },
  municipality: {
    type: String,
    required: true,
    enum: ["Bujanoci", "Presheva", "Medvegja"], // Restricting values
  },
});

const Location = mongoose.model("Location", LocationSchema);

export default Location;
