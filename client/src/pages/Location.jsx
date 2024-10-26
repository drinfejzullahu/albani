//import React from "react";
//import axios from "axios";
//import { useFormik } from "formik";

//function AddLocation() {
//  const formik = useFormik({
//    initialValues: {
//      location: "", // Input field for location name
//    },
//    onSubmit: async (values) => {
//      const body = {
//        location: values.location || "New Location", // Use input value or default name
//      };
//      try {
//        const response = await axios.post(
//          `http://localhost:3000/api/locations`,
//          body
//        );
//        alert("Location added successfully!"); // Notify success
//      } catch (error) {
//        console.error("Error:", error);
//      }
//    },
//  });

//  return (
//    <div className="p-60 pt-20 pb-20">
//      <h1 className="text-3xl font-bold text-center mb-6">Shto një lokacion</h1>
//      <form onSubmit={formik.handleSubmit} className="mb-6 flex flex-col gap-4">
//        <label className="mb-2 font-semibold">Lokacioni</label>
//        <input
//          type="text"
//          name="location" // For entering the location name
//          value={formik.values.location}
//          onChange={formik.handleChange}
//          className="border border-gray-300 rounded-lg p-2 w-full"
//        />

//        <button
//          type="submit"
//          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px]"
//        >
//          Shto lokacionin
//        </button>
//      </form>
//    </div>
//  );
//}

//export default AddLocation;

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";

function AddLocation() {
  const [locations, setLocations] = useState([]);
  const [editingLocationId, setEditingLocationId] = useState(null);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Handle editing a location
  const handleEdit = (location) => {
    setEditingLocationId(location._id);
    formik.setValues({
      location: location.location, // Use location.location
    });
  };

  // Handle deleting a location
  const handleDelete = async (locationId) => {
    try {
      await axios.delete(`http://localhost:3000/api/locations/${locationId}`);
      setLocations(locations.filter((location) => location._id !== locationId));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  useEffect(() => {
    fetchLocations(); // Fetch locations on component mount
  }, []);

  const formik = useFormik({
    initialValues: {
      location: "", // For entering the location name
    },
    onSubmit: async (values) => {
      const body = {
        location: values.location || "New Location",
      };

      try {
        if (editingLocationId) {
          // Edit existing location
          await axios.put(
            `http://localhost:3000/api/locations/${editingLocationId}`,
            body
          );
          setLocations(
            locations.map((loc) =>
              loc._id === editingLocationId
                ? { ...loc, location: body.location }
                : loc
            )
          );
          setEditingLocationId(null);
        } else {
          // Add new location
          const response = await axios.post(
            `http://localhost:3000/api/locations`,
            body
          );
          setLocations([...locations, response.data]);
        }
        formik.resetForm();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  return (
    <div className="p-60 pt-6 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6">Shto një lokacion</h1>

      {/* Locations Table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Lokacioni</th>
            <th className="border p-2">Aksionet</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc._id} className="text-center">
              <td className="border p-2">{loc.location}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(loc)}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(loc._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add or Edit Location Form */}
      <h2 className="font-bold mb-2">Shto ose edito një lokacion</h2>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="location"
          value={formik.values.location}
          onChange={formik.handleChange}
          placeholder="Enter Location Name"
          className="border border-gray-300 rounded-lg p-2 w-full"
        />

        <button
          type="submit"
          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px]"
        >
          {editingLocationId ? "Update Location" : "Shto lokacionin"}
        </button>
      </form>
    </div>
  );
}

export default AddLocation;
