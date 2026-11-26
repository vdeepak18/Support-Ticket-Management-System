const labels = { open: 'Open', 'in-progress': 'In progress', resolved: 'Resolved', closed: 'Closed', low: 'Low', medium: 'Medium', high: 'High' };
const Badge = ({ value }) => <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{labels[value] || value}</span>;

export default Badge;
