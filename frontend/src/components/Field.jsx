const Field = ({ label, children }) => (
  <label className="block text-sm font-medium text-gray-700">
    <span className="block mb-1">{label}</span>
    {children}
  </label>
);

export default Field;
