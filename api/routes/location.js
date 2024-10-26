import {
  createLocation,
  getLocations,
  getPersonsByLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/location.js";

async function locationRoutes(fastify, options) {
  // Create Location
  fastify.post("/", createLocation);

  // Get all Locations
  fastify.get("/", getLocations);

  // Search Persons by Location
  fastify.get("/search/:location", getPersonsByLocation);

  // Update Location by ID
  fastify.put("/:id", updateLocation);

  // Delete Location by ID
  fastify.delete("/:id", deleteLocation);
}

export default locationRoutes;
