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
 * Other optional fields: location_url, time_open, contact
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createCenter = async (data) => {
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
	const res = await api.patch(`/api/centers/${id}`, data);
	return res.data;
};

/**
 * Delete a center by id
 * @param {number|string} id
 * @returns {Promise<null|Object>} returns nothing on 204, or data on other statuses
 */
export const deleteCenter = async (id) => {
	const res = await api.delete(`/api/centers/${id}`);
	return res;
};
