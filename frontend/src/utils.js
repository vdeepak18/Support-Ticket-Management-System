const errMsg = (e, fallback) => e.response?.data?.message || fallback;
const fmt = (d) => new Date(d).toLocaleDateString();

export { errMsg, fmt };
