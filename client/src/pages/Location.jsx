import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";

function AddLocation() {
  const [locations, setLocations] = useState([]);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [addLocation, setAddLocation] = useState(false);

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
      location: location.location,
      municipality: location.municipality, // Set the municipality
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
      municipality: "", // For selecting the municipality
    },
    onSubmit: async (values) => {
      const body = {
        location: values.location || "New Location",
        municipality: values.municipality || "Bujanoci", // Default to "Bujanoci" if none selected
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
                ? {
                    ...loc,
                    location: body.location,
                    municipality: body.municipality,
                  }
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
        setAddLocation(false);
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  return (
    <div className="p-60 pt-6 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6">Shto një lokacion</h1>

      {/* Add or Edit Location Form */}
      <h2 className="font-bold mb-2">Shto ose edito një lokacion</h2>
      {addLocation ? (
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="location"
            value={formik.values.location}
            onChange={formik.handleChange}
            placeholder="Enter Location Name"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />

          {/* Municipality Dropdown */}
          <select
            name="municipality"
            value={formik.values.municipality}
            onChange={formik.handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full"
          >
            <option value="" disabled>
              Zgjedh komunen
            </option>
            <option value="Bujanoci">Bujanoci</option>
            <option value="Presheva">Presheva</option>
            <option value="Medvegja">Medvegja</option>
          </select>

          <button
            type="submit"
            className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 mb-10 w-fit min-w-[200px]"
          >
            {editingLocationId ? "Update Location" : "Shto lokacionin"}
          </button>
        </form>
      ) : (
        <button
          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 mb-10 w-fit min-w-[200px]"
          onClick={() => setAddLocation(true)}
        >
          Shto lokacionin e ri
        </button>
      )}

      {/* Locations Table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Lokacioni</th>
            <th className="border p-2">Komuna</th>
            <th className="border p-2">Aksionet</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc._id} className="text-center">
              <td className="border p-2">{loc.location}</td>
              <td className="border p-2">{loc.municipality}</td>
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
    </div>
  );
}

export default AddLocation;
