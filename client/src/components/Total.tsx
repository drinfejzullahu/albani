interface TypeMapperItem {
  type: string;
  label: string;
}

interface Totals {
  [category: string]: {
    [type: string]: number;
  };
}

const typeMapper: TypeMapperItem[] = [
  { type: "livestock", label: "Blegtori" },
  { type: "tree", label: "Pemetari" },
  { type: "plant", label: "ProdhimBimor" },
  { type: "bee", label: "Bletari" },
  { type: "bird", label: "Shpezetari" },
  { type: "land", label: "Toka (m2)" },
  { type: "ownedLand", label: "Ne pronesi" }, // Special label for owned land
  { type: "rentedLand", label: "Me qira" }, // Special label for rented land
];

const getLabelForType = (type: string): string => {
  // Check for specific cases for land types first
  if (type === "ownedLand") {
    return "Ne pronesi";
  }
  if (type === "rentedLand") {
    return "Me qira";
  }

  const mapping = typeMapper.find((item) => item.type === type);
  return mapping ? mapping.label : type; // Return the type as a fallback if not found
};

interface TotalsCardProps {
  totals: Totals;
}

const TotalsCard: React.FC<TotalsCardProps> = ({ totals }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md mt-6">
      <h3 className="text-center text-xl font-bold mb-4">Totali</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(totals).map(([category, types]) => (
          <div
            key={category}
            className="border border-gray-100 rounded-lg bg-gray-50 p-4"
          >
            <h4 className="text-lg font-semibold mb-2 text-gray-800">
              {getLabelForType(category.replace("Totals", ""))}
            </h4>
            <ul className="space-y-1">
              {Object.entries(types).map(([type, total]) => (
                <li key={type} className="text-sm text-gray-700">
                  <span className="font-medium">{getLabelForType(type)}:</span>{" "}
                  {total}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalsCard;
