import { useFormik } from "formik";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Reusable Input Component
const Input = ({ label, name, type = "text", value, onChange }) => (
  <div className="flex flex-col">
    <label className="mb-2 font-semibold">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
  </div>
);

export const sectorData = [
  { name: "Bujqesi" },
  { name: "Blegtori" },
  { name: "Pemetari" },
  { name: "ProdhimBimor" },
  { name: "AgroBiznesFamiljar" },
  { name: "Bletari" },
  { name: "Shpeztari" },
];

function AddPersonAndAsset() {
  const { personId } = useParams();
  const navigate = useNavigate();
  const [personData, setPersonData] = useState(null);

  const [sections, setSections] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [locations, setLocations] = useState([]);
  const [assets, setAssets] = useState([
    { assetType: "", period: "", quantity: "", proofDocument: "" },
  ]);
  const [investments, setInvestments] = useState([
    { type: "", units: "", value: "", vat: "" },
  ]);
  const [livestockDetails, setLivestockDetails] = useState([
    { type: "", number: "" },
  ]);
  const [treeDetails, setTreeDetails] = useState([{ type: "", number: "" }]);
  const [birdDetails, setBirdDetails] = useState([{ type: "", number: "" }]);
  const [plantDetails, setPlantDetails] = useState([{ type: "", number: "" }]);

  useEffect(() => {
    const fetchPerson = async () => {
      if (personId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/persons/${personId}`
          );
          const person = response.data;
          setPersonData(person);

          // Set state with fetched data, or use default values if empty
          setAssets(
            person.assets ?? [
              { assetType: "", period: "", quantity: "", proofDocument: "" },
            ]
          );
          setInvestments(
            person.investments ?? [{ type: "", units: "", value: "", vat: "" }]
          );
          setLivestockDetails(
            person.livestockDetails ?? [{ type: "", number: "" }]
          );
          setTreeDetails(person.treeDetails ?? [{ type: "", number: "" }]);
          setBirdDetails(person.birdDetails ?? [{ type: "", number: "" }]);
          setPlantDetails(person.plantDetails ?? [{ type: "", number: "" }]);
          setSelectedSector(personData?.sectorType);
          setSelectedSection(personData?.sector);
        } catch (error) {
          console.error("Error fetching person:", error);
        }
      }
    };

    fetchPerson();
  }, [personId]);

  useEffect(() => {
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

    const fetchDefaultSections = async () => {
      if (selectedSector) {
        await fetchSections(selectedSector);
      }
    };

    fetchDefaultSections();
  }, [selectedSector]);

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

  const getEighteenYearsAgo = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };

  const formattedDateOfBirth = personData?.dateOfBirth
    ? new Date(personData?.dateOfBirth).toISOString().split("T")[0]
    : "";

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: personData?.name || "",
      parentName: personData?.parentName || "",
      dateOfBirth: formattedDateOfBirth,
      gender: personData?.gender || "",
      address: personData?.address || "",
      phone: personData?.phone || "",
      email: personData?.email || "",
      farmAddress: personData?.farmAddress || "",
      educationLevel: personData?.educationLevel || "",
      profession: personData?.profession || "",
      familyMembers: personData?.familyMembers || "",
      location: personData?.location || "",
      workingLandDetails: {
        ownedLand: personData?.workingLandDetails?.ownedLand || "",
        rentedLand: personData?.workingLandDetails?.rentedLand || "",
      },
      assets: personData?.assets || [],
      investments: personData?.investments || [],
      productsOrServices: personData?.productsOrServices || "",
      buyers: personData?.buyers || "",
      expectations: personData?.expectations || "",
      requests: personData?.requests || "",
      sectorType: personData?.sectorType || "",
      sector: personData?.sector || "",
      treeDetails: personData?.treeDetails || [],
      birdDetails: personData?.birdDetails || [],
      livestockDetails: personData?.livestockDetails || [],
      plantDetails: personData?.plantDetails || [],
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        // Add person
        const personData = {
          ...values,
          investments,
          sectorType: selectedSector,
          sector: selectedSection,
          proofDocument: values.proofDocument,
          workingLandDetails: values.workingLandDetails,
          livestockDetails:
            livestockDetails[0]?.type !== "" ? livestockDetails : undefined,
          treeDetails: treeDetails[0]?.type !== "" ? treeDetails : undefined,
          birdDetails: birdDetails[0]?.type !== "" ? birdDetails : undefined,
          plantDetails: plantDetails[0]?.type !== "" ? plantDetails : undefined,
          beeDetails:
            values?.beeDetails?.type !== "" ? values.beeDetails : undefined,
          assetsData: assets,
        };

        if (personId) {
          await axios.put(
            `http://localhost:3000/api/persons/${personId}`,
            personData
          );
        } else {
          await axios.post("http://localhost:3000/api/persons", personData);
        }

        resetForm();
        navigate("/");
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setSelectedSector(sector);
    setSelectedSection("");
  };

  const addAsset = () => {
    setAssets([
      ...assets,
      { assetType: "", period: "", quantity: "", proofDocument: "" },
    ]);
  };

  const handleAssetChange = (index, field, value) => {
    const newAssets = [...assets];
    newAssets[index][field] = value;
    setAssets(newAssets);
  };

  const handleInvestmentChange = (index, field, value) => {
    const newInvestments = [...investments];
    newInvestments[index][field] = value;
    setInvestments(newInvestments);
  };

  const handleLiveStockChange = (index, field, value) => {
    const newLivestock = [...livestockDetails];
    newLivestock[index][field] = value;
    setLivestockDetails(newLivestock);
  };

  const addLiveStock = () => {
    setLivestockDetails([...livestockDetails, { number: "", type: "" }]);
  };

  const handleTreeDetailsChange = (index, field, value) => {
    const newTreeDetails = [...treeDetails];
    newTreeDetails[index][field] = value;
    setTreeDetails(newTreeDetails);
  };
  const addTreeDetails = () => {
    setTreeDetails([...treeDetails, { number: "", type: "" }]);
  };

  const handleBirdDetailsChange = (index, field, value) => {
    const newBirdDetails = [...birdDetails];
    newBirdDetails[index][field] = value;
    setBirdDetails(newBirdDetails);
  };

  const addBirdDetails = () => {
    setBirdDetails([...birdDetails, { number: "", type: "" }]);
  };

  const handlePlantDetailsChange = (index, field, value) => {
    const newPlantDetails = [...plantDetails];
    newPlantDetails[index][field] = value;
    setPlantDetails(newPlantDetails);
  };
  const addPlantDetails = () => {
    setPlantDetails([...plantDetails, { number: "", type: "" }]);
  };
  // Function to add a new investment entry
  const addInvestment = () => {
    setInvestments([
      ...investments,
      { type: "", units: "", value: "", vat: "" },
    ]);
  };

  return (
    <div className="p-60 pt-6 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6">
        {personId ? "Edito personin" : "Shto person"}
      </h1>

      <form onSubmit={formik.handleSubmit} className="mb-6 flex flex-col gap-4">
        {/* Person Details */}
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Emri dhe Mbiemri"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <Input
            label="Emri i Prindit"
            name="parentName"
            value={formik.values.parentName}
            onChange={formik.handleChange}
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Datëlindja</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
              max={getEighteenYearsAgo()}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Lokacioni</label>
            <select
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">Zgjidh lokacionin</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.location}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Gjinia</label>
            <select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">Zgjidhe gjinine</option>
              <option value="m">Burrë</option>
              <option value="f">Grua</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Adresa e Banimit"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
          />
          <Input
            label="Numri i Telefonit"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <Input
            label="Adresa e Fermës/agrobiznesit"
            name="farmAddress"
            value={formik.values.farmAddress}
            onChange={formik.handleChange}
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <div>
            <label className="font-semibold">Përgatitja Shkollore</label>
            <select
              name="educationLevel"
              value={formik.values.educationLevel}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            >
              <option value="">Zgjidhe pergaditjen shkollore</option>
              <option value="fillore">Fillore</option>
              <option value="mesme">E Mesme</option>
              <option value="larte">E Larte</option>
            </select>
          </div>
          <Input
            label="Profesioni që Ushtroni"
            type="text"
            name="profession"
            value={formik.values.profession}
            onChange={formik.handleChange}
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Numri i Anëtarëve të Familjes"
            type="number"
            name="familyMembers"
            value={formik.values.familyMembers}
            onChange={formik.handleChange}
          />
        </div>

        <h2 className="text-xl font-semibold mt-4">
          Informata për Tokën dhe Veprimtarinë Bujqësore
        </h2>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Tokë në pronësi: (në hektarë)"
            name="workingLandDetails.ownedLand"
            value={formik.values.workingLandDetails.ownedLand}
            onChange={formik.handleChange}
            type="number"
          />
          <Input
            label="Tokë me qira: (në hektarë)"
            name="workingLandDetails.rentedLand"
            value={formik.values.workingLandDetails.rentedLand}
            onChange={formik.handleChange}
            type="number"
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold">Sektori</label>
            <select
              name="sector"
              value={selectedSector}
              onChange={handleSectorChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">Zgjidhe sektorin</option>
              {sectorData.map((sector) => (
                <option key={sector.name} value={sector.name}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sections based on selected sector */}
          {sections.length > 0 &&
            ![
              "Blegtori",
              "Bletari",
              "Shpeztari",
              "Pemetari",
              "ProdhimBimor",
            ].includes(selectedSector) && (
              <div className="flex flex-col">
                <label className="mb-2 font-semibold">Zgjidhe seksionin</label>
                <select
                  name="section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
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

        {selectedSector === "Blegtori" &&
          livestockDetails.map((livestock, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div
                key={index}
                className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2"
              >
                {sections.length > 0 && (
                  <div className="flex flex-col">
                    <select
                      name={`livestockDetails.type-${index}`}
                      value={livestock.type}
                      onChange={(e) =>
                        handleLiveStockChange(index, "type", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Lloji</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="number"
                  name={`livestockDetails.number-${index}`}
                  value={livestock.number}
                  onChange={(e) =>
                    handleLiveStockChange(index, "number", e.target.value)
                  }
                  placeholder="Numri"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
          ))}
        {selectedSector === "Blegtori" && (
          <button
            type="button"
            onClick={addLiveStock}
            className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px] mb-4"
          >
            Shto
          </button>
        )}
        {selectedSector === "Pemetari" &&
          treeDetails.map((tree, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div
                key={index}
                className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2"
              >
                {sections.length > 0 && (
                  <div className="flex flex-col">
                    <select
                      name={`treeDetails.type-${index}`}
                      value={tree.type}
                      onChange={(e) =>
                        handleTreeDetailsChange(index, "type", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Lloji</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="number"
                  name={`treeDetails.number-${index}`}
                  value={tree.number}
                  onChange={(e) =>
                    handleTreeDetailsChange(index, "number", e.target.value)
                  }
                  placeholder="Numri"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
          ))}
        {selectedSector === "Pemetari" && (
          <button
            type="button"
            onClick={addTreeDetails}
            className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px] mb-4"
          >
            Shto
          </button>
        )}
        {selectedSector === "ProdhimBimor" &&
          plantDetails.map((plant, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div
                key={index}
                className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2"
              >
                {sections.length > 0 && (
                  <div className="flex flex-col">
                    <select
                      name={`plantDetails.type-${index}`}
                      value={plant.type}
                      onChange={(e) =>
                        handlePlantDetailsChange(index, "type", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Lloji</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="number"
                  name={`plantDetails.number-${index}`}
                  value={plant.number}
                  onChange={(e) =>
                    handlePlantDetailsChange(index, "number", e.target.value)
                  }
                  placeholder="Numri"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
          ))}
        {selectedSector === "ProdhimBimor" && (
          <button
            type="button"
            onClick={addPlantDetails}
            className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px] mb-4"
          >
            Shto
          </button>
        )}

        {selectedSector === "Bletari" ? (
          <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 font-semibold">Lloji</h2>
              <input
                type="text"
                name="beeDetails.type"
                value={formik.values.beeDetails.type}
                onChange={formik.handleChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Numri i koshereve</h2>
              <input
                type="number"
                name="beeDetails.number"
                value={formik.values.beeDetails.number}
                onChange={formik.handleChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
          </div>
        ) : null}

        {selectedSector === "Shpeztari" &&
          birdDetails.map((bird, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div
                key={index}
                className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2"
              >
                {sections.length > 0 && (
                  <div className="flex flex-col">
                    <select
                      name={`birdDetails.type-${index}`}
                      value={bird.type}
                      onChange={(e) =>
                        handleBirdDetailsChange(index, "type", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Lloji</option>
                      {sections.map((section) => (
                        <option key={section._id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="number"
                  name={`birdDetails.number-${index}`}
                  value={bird.number}
                  onChange={(e) =>
                    handleBirdDetailsChange(index, "number", e.target.value)
                  }
                  placeholder="Numri"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
          ))}
        {selectedSector === "Shpeztari" && (
          <button
            type="button"
            onClick={addBirdDetails}
            className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px] mb-4"
          >
            Shto
          </button>
        )}
        <h2 className="text-xl font-semibold mt-4">Asetet</h2>
        {assets.map((asset, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
              <Input
                label="Tipi i aseteve (Toke, Ara, Livadhe dhe jonxhë)"
                name={`assetType-${index}`}
                value={asset.assetType}
                onChange={(e) =>
                  handleAssetChange(index, "assetType", e.target.value)
                }
              />
              <Input
                label="Periudha e Shfrytëzimit të Tokës në qesim (vite):"
                name={`period-${index}`}
                value={asset.period}
                onChange={(e) =>
                  handleAssetChange(index, "period", e.target.value)
                }
              />
            </div>
            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
              <Input
                label="Sasia (në metër katror/në hektarë)"
                name={`quantity-${index}`}
                type="number"
                value={asset.quantity}
                onChange={(e) =>
                  handleAssetChange(index, "quantity", e.target.value)
                }
              />
              <Input
                label="Certifikata e Pronësisë së Tokës - dëshmi vërtetimi i ekonomisë bujqësore:"
                name={`proofDocument-${index}`}
                value={asset.proofDocument}
                onChange={(e) =>
                  handleAssetChange(index, "proofDocument", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addAsset}
          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px] mb-4"
        >
          Shto aset tjeter
        </button>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Prodhimet e Planifikuara për Zgjerim"
            name="productsOrServices"
            value={formik.values.productsOrServices}
            onChange={formik.handleChange}
          />

          <Input
            label="Cilët janë blerësit e ardhshëm të prodhimeve tuaja?"
            name="buyers"
            value={formik.values.buyers}
            onChange={formik.handleChange}
          />
        </div>
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
          <Input
            label="Cilat janë pritjet tuaja për rritjen e prodhimit dhe të hyrave në 2 vitet e ardhshme?"
            name="expectations"
            value={formik.values.expectations}
            onChange={formik.handleChange}
          />

          <div className="flex flex-col">
            <label className="mb-2 font-semibold">
              Cilët janë kërkesat tuaja nga ne dhe çka do të zëvendëson apo
              përmirëson secili investim?
            </label>
            <textarea
              name="requests"
              value={formik.values.requests}
              onChange={formik.handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4">
          Investimet e Planifikuara
        </h2>
        {investments.map((investment, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
              <Input
                label="Emri / lloji i pajisjeve / makinerisë / shërbimeve etj."
                name={`type-${index}`}
                value={investment.type}
                onChange={(e) =>
                  handleInvestmentChange(index, "type", e.target.value)
                }
              />
              <Input
                label="Njësitë (m², ditë pune, kg, etj.)"
                name={`units-${index}`}
                value={investment.units}
                onChange={(e) =>
                  handleInvestmentChange(index, "units", e.target.value)
                }
              />
            </div>
            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
              <Input
                label="Vlera pa TVSh"
                name={`value-${index}`}
                type="number"
                value={investment.value}
                onChange={(e) =>
                  handleInvestmentChange(index, "value", e.target.value)
                }
              />
              <Input
                label="TVSh"
                name={`vat-${index}`}
                value={investment.vat}
                onChange={(e) =>
                  handleInvestmentChange(index, "vat", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addInvestment}
          className="border-blue-500 border text-blue-500 bg-transparent px-4 py-2 rounded-lg mt-2 w-fit min-w-[200px]"
        >
          Shto investim tjeter
        </button>

        <button
          type="submit"
          className="border-green-700 border text-green-700 bg-transparent px-4 py-2 rounded-lg mt-4 w-fit min-w-[200px]"
        >
          {personId ? "Edito personin" : "Shto personin"}
        </button>
      </form>
    </div>
  );
}

export default AddPersonAndAsset;
