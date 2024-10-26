import {
  createPerson,
  getPersons,
  getPersonById,
  updatePerson,
  deletePerson,
  addSection,
  getSections,
  deleteSection,
  updateSection,
} from "../controllers/person.js";

async function personRoutes(fastify, options) {
  // Create Person
  fastify.post("/", createPerson);

  // Get all Persons
  fastify.get("/", getPersons);

  // Get a Person by ID
  fastify.get("/:id", getPersonById);

  // Update a Person by ID
  fastify.put("/:id", updatePerson);

  // Delete a Person by ID
  fastify.delete("/:id", deletePerson);
  fastify.post("/sections", addSection);
  fastify.get("/sections/:sectorType", getSections);
  fastify.put("/sections/:id", updateSection);
  fastify.delete("/sections/:sectorType/:id", deleteSection);
}

export default personRoutes;
