import Fastify from "fastify"; // Import Fastify
import cors from "@fastify/cors"; // Import CORS
import connectDB from "./config/db.js"; // Import DB connection function

// Import routes (ensure .js extensions are included)
import personRoutes from "./routes/person.js";
import assetRoutes from "./routes/asset.js";
import locationRoutes from "./routes/location.js";

// Initialize Fastify instance
const fastify = Fastify({ logger: true });

// Connect to MongoDB
connectDB();

// Register CORS
fastify.register(cors, {
  origin: true,
});

// Register Routes
fastify.register(personRoutes, { prefix: "/api/persons" });
fastify.register(assetRoutes, { prefix: "/api/assets" });
fastify.register(locationRoutes, { prefix: "/api/locations" });

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
