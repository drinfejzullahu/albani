import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} from "../controllers/asset.js";

async function assetRoutes(fastify, options) {
  fastify.post("/", createAsset); // Create Asset
  fastify.get("/", getAssets); // Get all Assets
  fastify.get("/:id", getAssetById); // Get Asset by ID
  fastify.put("/:id", updateAsset); // Update Asset by ID
  fastify.delete("/:id", deleteAsset); // Delete Asset by ID
}

export default assetRoutes;
