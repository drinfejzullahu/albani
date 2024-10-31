import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const sectorData = [
  { name: "Bujqesi" },
  { name: "Blegtori" },
  { name: "Pemetari" },
  { name: "ProdhimBimor" },
  { name: "AgroBiznesFamiljar" },
  { name: "Bletari" },
];

const municipalities = ["Bujanoci", "Presheva", "Medvegja"];

const DetailsModal = ({ type, data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="font-semibold mb-4">Detajet e {type} </h2>
        <table className="min-w-full text-sm border w-[400px]">
          <thead>
            <tr>
              <th className="border px-4 py-2">Tipi</th>
              <th className="border px-4 py-2">Sasia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((details, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{details.type || "-"}</td>
                <td className="border px-4 py-2">{details.number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          Mbylle
        </button>
      </div>
    </div>
  );
};

function Persons() {
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [personsPerPage] = useState(12);
  const [showAssetsModal, setShowAssetsModal] = useState(null);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSectorType, setSelectedSectorType] = useState("");
  const [selectedSectorModel, setSelectedSectorModel] = useState("");
  const [locations, setLocations] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/persons")
      .then((response) => setPersons(response.data))
      .catch((error) => console.error("Error:", error));
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/locations");
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchSections = async (selectedSectorType) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/persons/sections/${selectedSectorType}`
        );
        setSections(response.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    const fetchDefaultSections = async () => {
      if (selectedSectorType) {
        await fetchSections(selectedSectorType);
      }
    };

    fetchDefaultSections();
  }, [selectedSectorType]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (personId) => {
    try {
      await axios.delete(`http://localhost:3000/api/persons/${personId}`);
      setPersons((prevPersons) =>
        prevPersons.filter((p) => p._id !== personId)
      );
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const filteredPersons = persons
    .filter((person) => {
      // Calculate the total count for tree, livestock, plant, and bee details
      const treeTotal = person.treeDetails.reduce(
        (sum, tree) => sum + tree.number,
        0
      );
      const livestockTotal = person.livestockDetails.reduce(
        (sum, livestock) => sum + livestock.number,
        0
      );
      const plantTotal = person.plantDetails.reduce(
        (sum, plant) => sum + plant.number,
        0
      );
      const beeTotal = person.beeDetails?.number || 0;

      // Define matching conditions for each filter
      const municipalityMatch = selectedMunicipality
        ? person.location?.municipality === selectedMunicipality
        : true;
      const locationMatch = selectedLocation
        ? person.location?._id === selectedLocation
        : true;
      const sectorTypeMatch = selectedSectorType
        ? person.sectorType === selectedSectorType
        : true;
      const sectorModelMatch = selectedSectorModel
        ? person.sector === selectedSectorModel
        : true;
      const searchMatch = searchQuery
        ? person.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Additional filters based on the sector type and model
      let additionalFilters = true;
      if (selectedSectorModel) {
        switch (selectedSectorType) {
          case "Pemetari":
            additionalFilters = person.treeDetails.some(
              (tree) => tree?.type === selectedSectorModel
            );
            break;

          case "Blegtori":
            additionalFilters = person.livestockDetails.some(
              (livestock) => livestock.type === selectedSectorModel
            );
            break;

          case "ProdhimBimor":
            additionalFilters = person.plantDetails.some(
              (plant) => plant.type === selectedSectorModel
            );
            break;

          case "Bletari":
            additionalFilters = person.beeDetails.type === selectedSectorModel;
            break;

          default:
            additionalFilters = true;
            break;
        }
      }

      // Combine all matching conditions
      const finalMatch =
        municipalityMatch &&
        locationMatch &&
        sectorTypeMatch &&
        sectorModelMatch &&
        searchMatch &&
        additionalFilters;

      return finalMatch;
    })
    .map((person) => {
      // Add the total count as a new property for sorting
      const totalItems =
        person.treeDetails.reduce((sum, tree) => sum + tree.number, 0) +
        person.livestockDetails.reduce(
          (sum, livestock) => sum + livestock.number,
          0
        ) +
        person.plantDetails.reduce((sum, plant) => sum + plant.number, 0) +
        (person.beeDetails?.number || 0);

      return { ...person, totalItems };
    })
    .sort((a, b) => b.totalItems - a.totalItems);

  const indexOfLastPerson = currentPage * personsPerPage;
  const indexOfFirstPerson = indexOfLastPerson - personsPerPage;
  const currentPersons = filteredPersons.slice(
    indexOfFirstPerson,
    indexOfLastPerson
  );

  const totalPages = Math.ceil(filteredPersons.length / personsPerPage);

  const handleExportToExcel = () => {
    let data = filteredPersons?.length > 0 ? filteredPersons : persons;

    const headers = [
      [
        "Emri dhe mbiemri",
        "Emri i prindit",
        "Datëlindja",
        "Gjinia",
        "Numri i telefonit",
        "Email",
        "Adresa e fermës",
        "Adresa personale",
        "Përgatitja Shkollore",
        "Profesioni",
        "Numri i Anëtarëve të Familjes",
        "Komuna",
        "Lokacioni",
        "Tokë në pronësi (hektarë ose m2)",
        "Tokë me qira (hektarë ose m2)",
        "Tipi i sektorit",
        "Sektori",
        "Asetet",
        "Investimet",
        "Detajet",
      ],
    ];

    const exportData = data.map((person) => {
      // Flatten arrays of objects (e.g., assets, investments, treeDetails, etc.)
      const assets =
        person.assets
          ?.map((asset) => `Tipi: ${asset.assetType}, Sasia: ${asset.quantity}`)
          .join("; ") || "-";
      const investments =
        person.investments
          ?.map(
            (investment) =>
              `Tipi: ${investment.type}, Sasia: ${investment.units}, Vlera: ${investment.value}`
          )
          .join("; ") || "-";
      const treeDetails =
        (person.treeDetails.length > 0 &&
          person.treeDetails
            ?.map((tree) => `Tipi: ${tree.type}, Numri: ${tree.number}`)
            .join("; ")) ||
        undefined;
      const livestockDetails =
        (person.livestockDetails.length > 0 &&
          person.livestockDetails
            ?.map(
              (livestock) =>
                `Tipi: ${livestock.type}, Numri: ${livestock.number}`
            )
            .join("; ")) ||
        undefined;
      const plantDetails =
        (person.plantDetails?.length > 0 &&
          person?.plantDetails
            ?.map((plant) => `Tipi: ${plant.type}, Numri: ${plant.number}`)
            .join("; ")) ||
        undefined;

      const beeDetails = `Tipi: ${person?.beeDetails?.type}, Numri: ${person?.beeDetails?.number}`;

      const firstAvailableDetails =
        treeDetails || plantDetails || livestockDetails || beeDetails || "-";

      return [
        person.name || "-",
        person.parentName || "-",
        person.dateOfBirth
          ? new Date(person.dateOfBirth).toLocaleDateString()
          : "-",
        person.gender === "m" ? "Burrë" : "Grua",
        person.phone || "-",
        person.email || "-",
        person.farmAddress || "-",
        person.address || "-",
        person.educationLevel || "-",
        person.profession || "-",
        person.familyMembers || "-",
        person.location?.municipality || "-",
        person.location?.location || "-",
        person.workingLandDetails?.ownedLand || "-",
        person.workingLandDetails?.rentedLand || "-",
        person.sectorType || "-",
        person.sector || "-",
        assets,
        investments,
        firstAvailableDetails,
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([["Personët"]]); // Set title in first row
    XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A2" }); // Headers start on the 2nd row
    XLSX.utils.sheet_add_aoa(worksheet, exportData, { origin: "A3" }); // Data starts on the 3rd row

    // Create the workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personët");

    // Applying styles
    worksheet["A1"].s = {
      font: { bold: true, sz: 18 },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Merge title row to center the title across all columns
    const endColumn = String.fromCharCode(
      "A".charCodeAt(0) + headers[0].length - 1
    );
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers[0].length - 1 } },
    ];

    // Style headers
    headers[0].forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    });

    // Style data rows
    exportData.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIndex + 2,
          c: colIndex,
        });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
          };
        }
      });
    });

    // Auto-fit column widths
    const colWidths = headers[0].map((header, index) => {
      const maxLength = Math.max(
        ...exportData.map((row) => row[index]?.toString().length || 0),
        header.length
      );
      return { wch: Math.max(maxLength + 2, 10) }; // Minimum width of 10
    });
    worksheet["!cols"] = colWidths;

    // Export workbook
    XLSX.writeFile(
      workbook,
      `Personet.${new Date().toLocaleDateString()}.xlsx`
    );
  };
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Lista e personëve</h1>

      {currentPersons.length > 0 ? (
        <>
          <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Kërko nga komuna</label>
              <select
                value={selectedMunicipality}
                onChange={(e) => {
                  setSelectedMunicipality(e.target.value);
                  setLocations(
                    locations.filter(
                      (location) => location?.municipality === e.target.value
                    )
                  );
                }}
                className="border p-2 mb-4 w-full"
              >
                <option value="">Zgjidhe komunen</option>
                {municipalities.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Kërko nga lokacioni</label>
              <select
                disabled={!selectedMunicipality}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="">Zgjidhe lokacionin</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold">Kërko nga sektori</label>
              <select
                value={selectedSectorType}
                onChange={(e) => {
                  setSelectedSectorModel("");
                  setSelectedSectorType(e.target.value);
                }}
                className="border rounded-lg p-2"
              >
                <option value="">Zgjidhe sektorin</option>
                {sectorData?.map((sector) => (
                  <option key={sector.name} value={sector.name}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            {sections.length > 0 && (
              <div className="flex flex-col">
                <label className="mb-2 font-semibold">Kërko nga seksioni</label>
                <select
                  name="section"
                  value={selectedSectorModel}
                  onChange={(e) => setSelectedSectorModel(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                >
                  <option value="">Zgjidhe seksionin</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-row items-end justify-between mb-4">
            <div>
              <label className="font-semibold">Kërko nga emri</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg p-2 w-full mt-2"
              />
            </div>
            <div>
              <button
                onClick={handleExportToExcel}
                className="border border-green-700 text-green-700  px-4 py-2 rounded "
              >
                Eksporto ne Excel
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="overflow-x-auto">
        {currentPersons.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Emri dhe mbiemri</th>
                <th className="py-3 px-6 text-left">Emri i prindit</th>
                <th className="py-3 px-6 text-left">Datëlindja</th>
                <th className="py-3 px-6 text-left">Gjinia</th>
                <th className="py-3 px-6 text-left">Numri i telefonit</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Adresa e fermes</th>
                <th className="py-3 px-6 text-left">Adresa personale</th>
                <th className="py-3 px-6 text-left">Përgatitja Shkollore</th>
                <th className="py-3 px-6 text-left">Profesioni</th>
                <th className="py-3 px-6 text-left">
                  Numri i Anëtarëve të Familjes
                </th>
                <th className="py-3 px-6 text-left">Lokacioni</th>
                <th className="py-3 px-6 text-left">Komuna</th>
                <th className="py-3 px-6 text-center">
                  Tokë në pronësi (hektarë ose m2)
                </th>
                <th className="py-3 px-6 text-center">
                  Tokë me qira (hektarë ose m2)
                </th>
                <th className="py-3 px-6 text-left">Tipi i sektorit</th>
                <th className="py-3 px-6 text-left">Sektori</th>
                <th className="py-3 px-6 text-center">Asetet</th>
                <th className="py-3 px-6 text-center">Investimet</th>
                <th className="py-3 px-6 text-center">Detajet</th>

                <th className="py-3 px-6 text-center">Aksionet</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {currentPersons.map((person) => (
                <tr
                  key={person._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6">{person.name || "-"}</td>
                  <td className="py-3 px-6">{person.parentName || "-"}</td>
                  <td className="py-3 px-6">
                    {person.dateOfBirth
                      ? new Date(person.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-6">
                    {person.gender && person?.gender === "m"
                      ? "Burrë"
                      : "Grua" ?? "-"}
                  </td>
                  <td className="py-3 px-6">{person.phone || "-"}</td>
                  <td className="py-3 px-6">{person.email || "-"}</td>
                  <td className="py-3 px-6">{person.farmAddress || "-"}</td>
                  <td className="py-3 px-6">{person.address || "-"}</td>
                  <td className="py-3 px-6">{person.educationLevel || "-"}</td>
                  <td className="py-3 px-6">{person.profession || "-"}</td>
                  <td className="py-3 px-6">{person.familyMembers || "-"}</td>
                  <td className="py-3 px-6">
                    {person.location?.location || "-"}
                  </td>
                  <td className="py-3 px-6">
                    {person.location?.municipality || "-"}
                  </td>
                  <td className="py-3 px-6">
                    {person.workingLandDetails?.ownedLand || "-"}
                  </td>
                  <td className="py-3 px-6">
                    {person.workingLandDetails?.rentedLand || "-"}
                  </td>
                  <td className="py-3 px-6">{person.sectorType || "-"}</td>
                  <td className="py-3 px-6">{person.sector || "-"}</td>
                  <td className="py-3 px-6 text-center">
                    {person.assets && person.assets.length > 0 ? (
                      <button
                        onClick={() => setShowAssetsModal(person)}
                        className="text-blue-500 hover:underline"
                      >
                        Shiko asetet
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {person.investments && person.investments.length > 0 ? (
                      <button
                        onClick={() => setShowInvestmentsModal(person)}
                        className="text-blue-500 hover:underline"
                      >
                        Shiko investimet
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-6 text-center flex flex-row min-w-[230px]">
                    {person.plantDetails.length > 0 && (
                      <button
                        onClick={() => {
                          setShowDetailsModal({
                            type: "Bimore",
                            data: person.treeDetails,
                          });
                        }}
                        className="bg-purple-500 text-white px-4 py-2 rounded mx-2"
                      >
                        Detajet bimore
                      </button>
                    )}
                    {person.treeDetails.length > 0 && (
                      <button
                        onClick={() => {
                          setShowDetailsModal({
                            type: "Pemetari",
                            data: person.treeDetails,
                          });
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded mx-2"
                      >
                        Detajet e Pemetarise
                      </button>
                    )}
                    {person.livestockDetails.length > 0 && (
                      <button
                        onClick={() => {
                          setShowDetailsModal({
                            type: "Blegtori",
                            data: person.livestockDetails,
                          });
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded mx-2"
                      >
                        Detajet e Blegtorisë
                      </button>
                    )}
                    {person.beeDetails?.type && (
                      <button
                        onClick={() => {
                          setShowDetailsModal({
                            type: "Bletari",
                            data: [person.beeDetails],
                          });
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded mx-2"
                      >
                        Detajet e Bletarise
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleDelete(person._id)}
                      className="text-red-500 hover:underline"
                    >
                      Fshij
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">Nuk ka persona.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`mx-1 px-3 py-1 rounded-lg ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {showDetailsModal && (
        <DetailsModal
          type={showDetailsModal.type}
          data={showDetailsModal.data}
          onClose={() => setShowDetailsModal(null)}
        />
      )}

      {/* Assets Modal */}
      {showAssetsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              Assetet per {showAssetsModal.name}
            </h2>
            <div>
              {showAssetsModal.assets.length > 0 ? (
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Tipi i asetit</th>
                      <th className="border px-4 py-2">Sasia</th>
                      <th className="border px-4 py-2">
                        Periudha e shfrytezimit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {showAssetsModal.assets.map((asset) => (
                      <tr key={asset._id}>
                        <td className="border px-4 py-2">
                          {asset.assetType || "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {asset.quantity || "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {asset.period || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Nuk ka asete</p>
              )}
            </div>
            <button
              onClick={() => setShowAssetsModal(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Mbylle
            </button>
          </div>
        </div>
      )}

      {/* Investments Modal */}
      {showInvestmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              Investimet per {showInvestmentsModal.name}
            </h2>
            <div>
              {showInvestmentsModal.investments.length > 0 ? (
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Emri</th>
                      <th className="border px-4 py-2">Njësitë</th>
                      <th className="border px-4 py-2">Vlera</th>
                      <th className="border px-4 py-2">TVSH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showInvestmentsModal.investments.map((investment) => (
                      <tr key={investment._id}>
                        <td className="border px-4 py-2">
                          {investment.type || "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {investment.units || "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {investment.value ?? "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {investment.vat ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Nuk ka investime</p>
              )}
            </div>
            <button
              onClick={() => setShowInvestmentsModal(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Mbylle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Persons;
