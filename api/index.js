import Fastify from "fastify";
import cors from "@fastify/cors";
import connectDB from "./config/db.js";
import personRoutes from "./routes/person.js";
import assetRoutes from "./routes/asset.js";
import locationRoutes from "./routes/location.js";

import Person from "./models/person.js";

const fastify = Fastify({ logger: true });

connectDB().then(() => {
  migratePersonIds();
});

// Register CORS
fastify.register(cors, {
  origin: true,
});

// Register Routes
fastify.register(personRoutes, { prefix: "/api/persons" });
fastify.register(assetRoutes, { prefix: "/api/assets" });
fastify.register(locationRoutes, { prefix: "/api/locations" });

// Migration script
const migratePersonIds = async () => {
  try {
    // Fetch all persons sorted by createdAt in ascending order
    const persons = await Person.find().sort({ createdAt: 1 });

    // Assign sequential IDs to each person
    for (let i = 0; i < persons.length; i++) {
      persons[i].id = i + 1; // Assign id starting from 1
      await persons[i].save(); // Save each updated person document
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server is running on port 3000`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
