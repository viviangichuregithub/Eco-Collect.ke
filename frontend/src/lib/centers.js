// frontend/src/lib/centers.js
import api from "./api";

/**
 * Fetch all centers
 * @returns {Promise<Array>}
 */
export const listCenters = async () => {
	const res = await api.get("/api/centers/");
	return res.data;
};

/**
 * Create a new center.
 * Payload should include at least: { location, created_by }
 * Optional fields: name, company, location_url, time_open, contact
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createCenter = async (data) => {
	// expected shape:
	// { name?, company?, location, created_by, location_url?, time_open?, contact? }
	const res = await api.post("/api/centers/", data);
	return res.data;
};

/**
 * Get a single center by id
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getCenter = async (id) => {
	const res = await api.get(`/api/centers/${id}`);
	return res.data;
};

/**
 * Update a center (partial or full)
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateCenter = async (id, data) => {
	// allowed keys: name, company, location, location_url, time_open, contact, total_waste_collected
	const res = await api.patch(`/api/centers/${id}`, data);
	return res.data;
};

/**
 * Delete a center by id
 * @param {number|string} id
 * @returns {Promise<boolean|Object>} returns true on 204, otherwise response data
 */
export const deleteCenter = async (id) => {
	const res = await api.delete(`/api/centers/${id}`);
	// return true when deleted (204), otherwise return response data for caller to inspect
	if (res.status === 204) return true;
	return res.data;
};
