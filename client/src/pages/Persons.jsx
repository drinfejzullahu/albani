import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import DetailsModal from "../components/modals/Details";
import { sectorData } from "../data_types/sector";
import { handleExportToExcel } from "../helpers/excel";
import { groupAndSumByType } from "../helpers/common";
import TotalsCard from "../components/Total";
import { municipalities } from "../data_types/common";

function Persons() {
  const [persons, setPersons] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
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

  const navigate = useNavigate();

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

  useEffect(() => {
    filterPersons();
  }, [
    selectedMunicipality,
    selectedLocation,
    selectedSectorType,
    selectedSectorModel,
    searchQuery,
  ]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (personId) => {
    const isConfirmed = window.confirm(
      "A je i sigurt që dëshiron të fshish këtë person?"
    );
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/persons/${personId}`);
      setPersons((prevPersons) =>
        prevPersons.filter((p) => p._id !== personId)
      );
    } catch (error) {
      console.error("Error deleting person:", error);
    }
  };

  const handleEdit = async (personId) => {
    navigate(`/edit-person/${personId}`);
  };

  const filterPersons = () => {
    const updatedPersons = persons
      .filter((person) => {
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
              additionalFilters =
                person.beeDetails?.type === selectedSectorModel;
              break;
            case "Shpeztari":
              additionalFilters = person.birdDetails.some(
                (bird) => bird?.type === selectedSectorModel
              );
              break;
            default:
              additionalFilters = true;
          }
        }

        return (
          municipalityMatch &&
          locationMatch &&
          sectorTypeMatch &&
          sectorModelMatch &&
          searchMatch &&
          additionalFilters
        );
      })
      .map((person) => {
        const totalItems =
          person.treeDetails.reduce((sum, tree) => sum + tree.number, 0) +
          person.livestockDetails.reduce(
            (sum, livestock) => sum + livestock.number,
            0
          ) +
          person.plantDetails.reduce((sum, plant) => sum + plant.number, 0) +
          person.birdDetails.reduce((sum, bird) => sum + bird.number, 0) +
          (person.beeDetails?.number || 0);

        return { ...person, totalItems };
      })
      .sort((a, b) => b.totalItems - a.totalItems);

    setFilteredPersons(updatedPersons);
  };

  // Reset function to restore the initial state
  const resetFilters = () => {
    setSelectedMunicipality("");
    setSelectedLocation("");
    setSelectedSectorType("");
    setSelectedSectorModel("");
    setSearchQuery("");
    setFilteredPersons(persons); // Reset back to the original list
  };

  const groupedTotals = {
    treeTotals: groupAndSumByType(
      filteredPersons.flatMap((p) => p.treeDetails)
    ),
    livestockTotals: groupAndSumByType(
      filteredPersons.flatMap((p) => p.livestockDetails)
    ),
    plantTotals: groupAndSumByType(
      filteredPersons.flatMap((p) => p.plantDetails)
    ),
    beeTotals: groupAndSumByType(
      filteredPersons.map((p) => p.beeDetails).filter(Boolean)
    ),
    birdTotals: groupAndSumByType(
      filteredPersons.flatMap((p) => p.birdDetails)
    ),
    landTotals: {
      ownedLand: filteredPersons.reduce(
        (sum, p) => sum + (p.workingLandDetails?.ownedLand || 0),
        0
      ),
      rentedLand: filteredPersons.reduce(
        (sum, p) => sum + (p.workingLandDetails?.rentedLand || 0),
        0
      ),
    },
  };

  // Filter out any category where all totals are 0
  const filteredGroupedTotals = Object.fromEntries(
    Object.entries(groupedTotals).filter(([key, value]) => {
      if (typeof value === "object") {
        return Object.values(value).some((total) => total > 0);
      }
      return value > 0;
    })
  );

  const indexOfLastPerson = currentPage * personsPerPage;
  const indexOfFirstPerson = indexOfLastPerson - personsPerPage;
  const currentPersons = filteredPersons.slice(
    indexOfFirstPerson,
    indexOfLastPerson
  );

  const totalPages = Math.ceil(filteredPersons.length / personsPerPage);

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
                className="border border-blue-700 text-blue-700  px-4 py-2 rounded "
                onClick={resetFilters}
              >
                Reseto Filteret
              </button>
              <button
                onClick={() =>
                  handleExportToExcel(
                    filteredPersons?.length > 0 ? filteredPersons : persons
                  )
                }
                className="border border-green-700 text-green-700  px-4 py-2 rounded ml-4"
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
                <th className="py-3 px-6 text-left">Id</th>
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
                <th className="py-3 px-6 text-center">
                  Prodhimet e Planifikuara për Zgjerim
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
                  <td className="py-3 px-6">{person.id || "-"}</td>
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
                  <td className="py-3 px-6">
                    {person.productsOrServices || "-"}
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
                    {person.birdDetails.length > 0 && (
                      <button
                        onClick={() => {
                          setShowDetailsModal({
                            type: "Shpeztari",
                            data: person.birdDetails,
                          });
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded mx-2"
                      >
                        Detajet e Shpeztarise
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleDelete(person._id)}
                      className="text-red-500 hover:underline"
                    >
                      Fshij
                    </button>{" "}
                    <button
                      onClick={() => handleEdit(person._id)}
                      className="text-blue-500 hover:underline"
                    >
                      Edito
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center w-100 ">
            <button
              className="border border-blue-700 text-blue-700  px-4 py-2 rounded mb-4"
              onClick={resetFilters}
            >
              Reseto Filteret
            </button>
            <div className="text-center  text-gray-500">Nuk ka persona.</div>
          </div>
        )}
      </div>

      <TotalsCard totals={filteredGroupedTotals} />
      {showDetailsModal && (
        <DetailsModal
          type={showDetailsModal.type}
          data={showDetailsModal.data}
          onClose={() => setShowDetailsModal(null)}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className={`px-3 py-1 rounded-lg ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={currentPage === 1}
        >
          Mbrapa
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            // Only show the first, last, current, and neighboring pages
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return true;
            }
            return false;
          })
          .reduce((acc, page, index, arr) => {
            // Add ellipsis if there is a gap between consecutive pages
            if (index > 0 && page !== arr[index - 1] + 1) {
              acc.push("...");
            }
            acc.push(page);
            return acc;
          }, [])
          .map((page, index) =>
            typeof page === "number" ? (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-3 py-1 text-gray-500">
                ...
              </span>
            )
          )}

        {/* Next Button */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className={`px-3 py-1 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          disabled={currentPage === totalPages}
        >
          Para
        </button>
      </div>
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
                      <th className="border px-4 py-2">
                        Certifikata e Pronësisë së Tokës - dëshmi vërtetimi i
                        ekonomisë bujqësore
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
                        <td className="border px-4 py-2">
                          {asset.proofDocument || "-"}
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
