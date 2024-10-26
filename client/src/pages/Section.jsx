//import { useFormik } from "formik";
//import axios from "axios";
//import { sectorData } from "./AddPerson";

//function AddSection() {
//  const formik = useFormik({
//    initialValues: {
//      sectorType: "", // For the dropdown selection
//      sectorName: "", // For the input field
//    },
//    onSubmit: async (values) => {
//      const body = {
//        sectorType: values.sectorType, // Selected sector type from the dropdown
//        sectionName: values.sectorName || "New Section", // Use input value or default name
//      };
//      try {
//        const response = await axios.post(
//          `http://localhost:3000/api/persons/sections`,
//          body
//        );
//        alert("Section added successfully!"); // Notify success
//      } catch (error) {
//        console.error("Error:", error);
//      }
//    },
//  });

//  return (
//    <div className="p-60 pt-20 pb-20">
//      <h1 className="text-3xl font-bold text-center mb-6">Shto një seksion</h1>
//      <form onSubmit={formik.handleSubmit} className="mb-6 flex flex-col gap-4">
//        <select
//          name="sectorType" // For selecting sector type
//          value={formik.values.sectorType}
//          onChange={formik.handleChange}
//          className="border border-gray-300 rounded-lg p-2 w-full mt-10"
//        >
//          <option value="">Zgjidhe sektorin</option>
//          {sectorData.map((sector) => (
//            <option key={sector.name} value={sector.name}>
//              {sector.name}
//            </option>
//          ))}
//        </select>

//        <input
//          type="text"
//          name="sectorName" // For entering the sector name
//          value={formik.values.sectorName}
//          onChange={formik.handleChange}
//          placeholder="Enter Sector Name"
//          className="border border-gray-300 rounded-lg p-2 w-full"
//        />

//        <button
//          type="submit"
//          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px]"
//        >
//          Shto seksionin
//        </button>
//      </form>
//    </div>
//  );
//}

//export default AddSection;

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { sectorData } from "./AddPerson";

function AddSection() {
  const [sections, setSections] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);

  const fetchSections = async (sectorType) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/persons/sections/${sectorType}`
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleEdit = (section) => {
    setEditingSectionId(section._id);
    formik.setValues({
      sectorType: section.selectedSector,
      sectorName: section.name,
    });
  };

  console.log(sections, "SECTIONS");

  const handleDelete = async (sectionId) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/persons/sections/${selectedSector}/${sectionId}`
      );
      setSections(sections.filter((section) => section._id !== sectionId));
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  useEffect(() => {
    if (selectedSector) {
      fetchSections(selectedSector);
    }
  }, [selectedSector]);

  const formik = useFormik({
    initialValues: {
      sectorType: "",
      sectorName: "",
    },
    onSubmit: async (values) => {
      const body = {
        sectorType: selectedSector,
        sectionName: values.sectorName || "New Section",
      };

      try {
        if (editingSectionId) {
          // Edit existing section
          await axios.put(
            `http://localhost:3000/api/persons/sections/${editingSectionId}`,
            body
          );
          setSections(
            sections.map((section) =>
              section._id === editingSectionId
                ? { ...section, name: body?.sectionName }
                : section
            )
          );
          setEditingSectionId(null);
        } else {
          // Add new section
          const response = await axios.post(
            `http://localhost:3000/api/persons/sections`,
            body
          );
          setSections([...sections, response.data]);
        }
        formik.resetForm();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  return (
    <div className="p-60 pt-6 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6">Seksionet</h1>

      {/* Sector Selection Dropdown */}
      <select
        value={selectedSector}
        onChange={(e) => setSelectedSector(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full mb-6"
      >
        <option value="">Zgjidhe sektorin</option>
        {sectorData.map((sector) => (
          <option key={sector.name} value={sector.name}>
            {sector.name}
          </option>
        ))}
      </select>

      {/* Sections Table */}
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Emri i seksionit</th>
            <th className="border p-2">Aksionet</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <tr key={section.id} className="text-center">
              <td className="border p-2">{section.name}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(section)}
                  className="text-blue-500 mr-2"
                >
                  Ndrysho
                </button>
                <button
                  onClick={() => handleDelete(section._id)}
                  className="text-red-500"
                >
                  Fshij
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-bold mb-2">Shto ose edito nje seksion</h2>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="sectorName"
          value={formik.values.sectorName}
          onChange={formik.handleChange}
          placeholder="Emri i seksionit"
          className="border border-gray-300 rounded-lg p-2 w-full"
        />

        <button
          type="submit"
          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px]"
        >
          {editingSectionId ? "Ndrysho seksionin" : "Shto seksionin"}
        </button>
      </form>
    </div>
  );
}

export default AddSection;
