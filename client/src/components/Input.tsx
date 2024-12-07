export default function Input({ label, name, type = "text", value, onChange }) {
  return (
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
}
