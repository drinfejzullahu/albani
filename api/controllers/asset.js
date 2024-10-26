import Asset from "../models/asset.js";

// Create Asset
const createAsset = async (request, reply) => {
  try {
    const asset = new Asset(request.body);
    await asset.save();

    reply.code(201).send(asset); // Send created asset with 201 status
  } catch (error) {
    reply.code(400).send({ error: "Bad Request", message: error.message });
  }
};

// Get All Assets
const getAssets = async (request, reply) => {
  try {
    const assets = await Asset.find().populate("person");

    reply.code(200).send(assets); // Send retrieved assets with 200 status
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Get Asset by ID
const getAssetById = async (request, reply) => {
  try {
    const asset = await Asset.findById(request.params.id).populate("person");

    if (!asset) {
      return reply
        .code(404)
        .send({ error: "Not Found", message: "Asset not found" });
    }
    reply.code(200).send(asset); // Send found asset with 200 status
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Update Asset
const updateAsset = async (request, reply) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
      }
    );
    if (!asset) {
      return reply
        .code(404)
        .send({ error: "Not Found", message: "Asset not found" });
    }

    reply.code(200).send(asset); // Send updated asset with 200 status
  } catch (error) {
    reply.code(400).send({ error: "Bad Request", message: error.message });
  }
};

// Delete Asset
const deleteAsset = async (request, reply) => {
  try {
    const asset = await Asset.findByIdAndDelete(request.params.id);
    if (!asset) {
      return reply
        .code(404)
        .send({ error: "Not Found", message: "Asset not found" });
    }
    reply.code(200).send({ message: "Asset deleted successfully" }); // Send success message with 200 status
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Export all controllers together
export { createAsset, getAssets, getAssetById, updateAsset, deleteAsset };
