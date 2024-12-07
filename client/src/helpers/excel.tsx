import * as XLSX from "xlsx";

export function handleExportToExcel(data: any) {
  const headers = [
    [
      "Id",
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
      "Prodhimet e Planifikuara për Zgjerim",
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
        ?.map(
          (asset) =>
            `Tipi: ${asset.assetType}, Sasia: ${asset.quantity}, Periudha: ${asset?.period}, Certifikata: ${asset?.proofDocument}`
        )
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
            (livestock) => `Tipi: ${livestock.type}, Numri: ${livestock.number}`
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

    const birdDetails =
      (person.birdDetails?.length > 0 &&
        person?.birdDetails
          ?.map((bird) => `Tipi: ${bird.type}, Numri: ${bird.number}`)
          .join("; ")) ||
      undefined;

    const firstAvailableDetails =
      treeDetails ||
      plantDetails ||
      livestockDetails ||
      beeDetails ||
      birdDetails ||
      "-";

    return [
      person.id || "-",
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
      person.productsOrServices || "-",
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
  XLSX.writeFile(workbook, `Personet.${new Date().toLocaleDateString()}.xlsx`);
}
