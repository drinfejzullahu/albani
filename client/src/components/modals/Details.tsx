export default function DetailsModal({ type, data, onClose }) {
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
}
