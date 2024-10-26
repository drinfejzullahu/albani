import Location from "../models/location.js";
import Person from "../models/person.js";

// Create Location
const createLocation = async (request, reply) => {
  try {
    const location = new Location(request.body);
    await location.save();
    reply.code(201).send(location);
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};

// Get All Locations
const getLocations = async (request, reply) => {
  try {
    const locations = await Location.find();
    reply.send(locations);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Search Persons by Location
const getPersonsByLocation = async (request, reply) => {
  try {
    const persons = await Person.find({
      location: request.params.location,
    });
    if (!persons) {
      return reply
        .code(404)
        .send({ message: "No persons found in this location" });
    }
    reply.send(persons);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Update Location
const updateLocation = async (request, reply) => {
  try {
    const location = await Location.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );
    if (!location) {
      return reply.code(404).send({ message: "Location not found" });
    }
    reply.send(location);
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
};

// Delete Location
const deleteLocation = async (request, reply) => {
  try {
    const location = await Location.findByIdAndDelete(request.params.id);
    if (!location) {
      return reply.code(404).send({ message: "Location not found" });
    }
    reply.send({ message: "Location deleted successfully" });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Export all controllers together
export {
  createLocation,
  getLocations,
  getPersonsByLocation,
  updateLocation,
  deleteLocation,
};
