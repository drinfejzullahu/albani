import Person from "../models/person.js";
import Asset from "../models/asset.js";

import {
  Bujqesi,
  Blegtori,
  Pemetari,
  ProdhimBimor,
  AgroBiznesFamiljar,
  Shpeztari,
} from "../models/sectors.js";

// Helper function to get the sector model based on sector type
const getSectorModel = (sectorType) => {
  switch (sectorType) {
    case "Bujqesi":
      return Bujqesi;
    case "Blegtori":
      return Blegtori;
    case "Pemetari":
      return Pemetari;
    case "ProdhimBimor":
      return ProdhimBimor;
    case "AgroBiznesFamiljar":
      return AgroBiznesFamiljar;
    case "Shpeztari":
      return Shpeztari;
    default:
      return null;
  }
};

// Create Person
const createPerson = async (request, reply) => {
  try {
    const { assetsData } = request.body;

    // Get the highest existing `id` in the collection
    const lastPerson = await Person.findOne().sort({ id: -1 }).select("id");

    const newId = lastPerson?.id ? lastPerson.id + 1 : 1; // Increment or start from 1

    // Create a new person with the incremented `id`
    const person = new Person({
      ...request.body,
      id: newId,
    });

    await person.save();

    if (assetsData && assetsData.length > 0) {
      const assetDocs = assetsData.map((asset) => ({
        ...asset,
        person: person._id,
      }));
      const createdAssets = await Asset.insertMany(assetDocs);

      // Update Person with references to created assets
      person.assets = createdAssets.map((asset) => asset._id);
      await person.save();
    }

    reply.code(201).send(person);
  } catch (error) {
    reply.code(400).send({ error: "Bad Request", message: error.message });
  }
};

// Get all Persons
const getPersons = async (request, reply) => {
  try {
    const persons = await Person.find().populate("location").populate("assets"); // Populate assets

    reply.send(persons);
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Get a Person by ID
const getPersonById = async (request, reply) => {
  try {
    const person = await Person.findById(request.params.id)
      .populate("sector")
      .populate("assets");

    if (!person) {
      reply.code(404).send({ error: "Not Found", message: "Person not found" });
    } else {
      reply.send(person);
    }
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Update a Person by ID
const updatePerson = async (request, reply) => {
  try {
    const { sectorType, assetsData } = request.body;

    let sector = null;
    if (sectorType) {
      const SectorModel = getSectorModel(sectorType);
      if (!SectorModel) {
        return reply
          .code(400)
          .send({ error: "Bad Request", message: "Invalid sector type" });
      }
      const sectorInstance = await new SectorModel();
      await sectorInstance.save();
      sector = sectorInstance._id;
    }

    // Update Person document with the new data
    const person = await Person.findByIdAndUpdate(
      request.params.id,
      { ...request.body, sector },
      { new: true }
    );

    if (!person) {
      return reply
        .code(404)
        .send({ error: "Not Found", message: "Person not found" });
    }

    // Handle Assets Data if provided
    if (assetsData && assetsData.length > 0) {
      const updatedAssets = [];
      const newAssets = [];

      // Loop through the assetsData to either update existing assets or create new ones
      for (let asset of assetsData) {
        if (asset._id) {
          // If _id is provided, try to find and update the existing asset
          const existingAsset = await Asset.findById(asset._id);

          if (existingAsset) {
            // Update fields that are provided in assetData
            existingAsset.assetType =
              asset.assetType || existingAsset.assetType;
            existingAsset.period = asset.period || existingAsset.period;
            existingAsset.quantity = asset.quantity || existingAsset.quantity;
            existingAsset.proofDocument =
              asset.proofDocument || existingAsset.proofDocument;

            // Save the updated asset
            await existingAsset.save();
            updatedAssets.push(existingAsset);
          } else {
            // If asset not found, create a new one
            const newAsset = new Asset({ ...asset, person: person._id });
            await newAsset.save();
            newAssets.push(newAsset);
          }
        } else {
          // If _id is not provided, create a new asset
          const newAsset = new Asset({ ...asset, person: person._id });
          await newAsset.save();
          newAssets.push(newAsset);
        }
      }

      const allAssets = [
        ...newAssets.map((asset) => asset._id), // Add new assets
        ...updatedAssets.map((asset) => asset._id), // Add updated assets
      ];

      // Ensure no duplicates by using `new Set`
      person.assets = [...new Set(allAssets)];
      await person.save();
    }

    // Send the updated person data in the response
    reply.send(person);
  } catch (error) {
    reply.code(400).send({ error: "Bad Request", message: error.message });
  }
};

// Delete a Person by ID
const deletePerson = async (request, reply) => {
  try {
    const person = await Person.findByIdAndDelete(request.params.id);
    if (!person) {
      reply.code(404).send({ error: "Not Found", message: "Person not found" });
    } else {
      reply.send({ message: "Person deleted successfully" });
    }
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Get Sections for a Sector
const getSections = async (request, reply) => {
  try {
    const { sectorType } = request.params;
    // Get the appropriate sector model
    const SectorModel = getSectorModel(sectorType);
    if (!SectorModel) {
      return reply
        .code(400)
        .send({ error: "Bad Request", message: "Invalid sector type" });
    }

    // Retrieve all sections for the specified sector
    const sections = await SectorModel.find();

    reply.code(200).send(sections); // Send the retrieved sections
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

const addSection = async (request, reply) => {
  try {
    const { sectorType, sectionName } = request.body;

    // Get the appropriate sector model
    const SectorModel = getSectorModel(sectorType);
    if (!SectorModel) {
      return reply
        .code(400)
        .send({ error: "Bad Request", message: "Invalid sector type" });
    }

    // Create a new section entry
    const newSection = { name: sectionName };

    // Save the new section to the sector model
    const sector = await SectorModel.create(newSection);

    reply.code(201).send(sector); // Send the newly created sector/section
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

const updateSection = async (request, reply) => {
  try {
    const { id } = request.params;
    const { sectorType, sectionName } = request.body;

    const SectorModel = getSectorModel(sectorType);
    if (!SectorModel) {
      return reply
        .code(400)
        .send({ error: "Bad Request", message: "Invalid sector type" });
    }

    // Update section name
    const updatedSection = await SectorModel.findByIdAndUpdate(
      id,
      { name: sectionName },
      { new: true }
    );

    if (!updatedSection) {
      return reply
        .code(404)
        .send({ error: "Not Found", message: "Section not found" });
    }

    reply.code(200).send(updatedSection);
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

const deleteSection = async (request, reply) => {
  try {
    const { sectorType, id } = request.params;

    // Get the appropriate sector model
    const SectorModel = getSectorModel(sectorType);
    if (!SectorModel) {
      return reply
        .code(400)
        .send({ error: "Bad Request", message: "Invalid sector type" });
    }

    const sector = await SectorModel.findByIdAndDelete(request.params.id);

    reply.send({ message: "Sector deleted successfully" });
  } catch (error) {
    reply
      .code(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
};

// Export all controllers together
export {
  createPerson,
  getPersons,
  getPersonById,
  updatePerson,
  deletePerson,
  getSections,
  addSection,
  updateSection,
  deleteSection,
};
