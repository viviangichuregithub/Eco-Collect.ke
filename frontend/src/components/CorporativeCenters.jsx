"use client"
import React, { useEffect, useState } from "react";
import { listCenters, createCenter, updateCenter, deleteCenter } from "../lib/centers";

export default function CorporativeCenters({ currentUserId = 1 }) {
	const [collectionCenters, setCollectionCenters] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const [form, setForm] = useState({
		name: "",
		company: "",
		address: "",
		phone: "",
		hours: "",
		location_url: "",
	});

	const [submitting, setSubmitting] = useState(false);

	const BUTTON_STYLE =
		"w-[132px] h-[32px] bg-[#355E62] rounded-[64px] text-[#ffff] hover:cursor-pointer font-poppins text-[14px] font-light";

	useEffect(() => {
		fetchCenters();
	}, []);

	const fetchCenters = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await listCenters();
			const normalized = (data || []).map((c) => ({
				id: c.id,
				name: c.name || c.location_name || "",
				company: c.company || "",
				address: c.location || "",
				phone: c.contact || "",
				hours: c.time_open || "",
				location_url: c.location_url || "",
				raw: c,
			}));
			setCollectionCenters(normalized);
		} catch (err) {
			console.error("Failed to load centers", err);
			setError("Failed to load centers");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
	};

	// ADD
	const openAdd = () => {
		setForm({
			name: "",
			company: "",
			address: "",
			phone: "",
			hours: "",
			location_url: "",
		});
		setIsAdding(true);
		setEditingId(null);
	};
	const cancelAdd = () => {
		setIsAdding(false);
		setForm({
			name: "",
			company: "",
			address: "",
			phone: "",
			hours: "",
			location_url: "",
		});
	};
	const handleAdd = async (e) => {
		e.preventDefault();
		if (!form.name.trim() || !form.address.trim()) {
			alert("Please provide at least a name and address for the center.");
			return;
		}

		const payload = {
			name: form.name.trim(),
			company: form.company.trim() || null,
			location: form.address.trim(),
			created_by: currentUserId,
			location_url: form.location_url.trim() || null,
			time_open: form.hours.trim() || null,
			contact: form.phone.trim() || null,
		};

		try {
			setSubmitting(true);
			const created = await createCenter(payload);
			const mapped = {
				id: created.id,
				name: created.name || payload.name,
				company: created.company || payload.company || "",
				address: created.location || payload.location,
				phone: created.contact || payload.contact || "",
				hours: created.time_open || payload.time_open || "",
				location_url: created.location_url || payload.location_url || "",
				raw: created,
			};
			setCollectionCenters((prev) => [mapped, ...prev]);
			cancelAdd();
		} catch (err) {
			console.error(err);
			alert("Failed to create center. See console for details.");
		} finally {
			setSubmitting(false);
		}
	};

	// EDIT
	const startEdit = (center) => {
		setEditingId(center.id);
		setIsAdding(false);
		setForm({
			name: center.name || "",
			company: center.company || "",
			address: center.address || "",
			phone: center.phone || "",
			hours: center.hours || "",
			location_url: center.location_url || "",
		});
	};
	const cancelEdit = () => {
		setEditingId(null);
		setForm({
			name: "",
			company: "",
			address: "",
			phone: "",
			hours: "",
			location_url: "",
		});
	};
	const saveEdit = async (e) => {
		e.preventDefault();
		if (!form.name.trim() || !form.address.trim()) {
			alert("Please provide at least a name and address.");
			return;
		}

		const payload = {
			name: form.name.trim(),
			company: form.company.trim() || null,
			location: form.address.trim(),
			time_open: form.hours.trim() || null,
			location_url: form.location_url.trim() || null,
			contact: form.phone.trim() || null,
		};

		try {
			setSubmitting(true);
			const updated = await updateCenter(editingId, payload);
			setCollectionCenters((prev) =>
				prev.map((c) =>
					c.id === editingId
						? {
								...c,
								name: updated.name || payload.name,
								company: updated.company || payload.company || "",
								address: updated.location || payload.location,
								phone: updated.contact || payload.contact || "",
								hours: updated.time_open || payload.time_open || "",
								location_url:
									updated.location_url || payload.location_url || "",
								raw: updated,
						  }
						: c
				)
			);
			cancelEdit();
		} catch (err) {
			console.error(err);
			alert("Failed to update center. See console for details.");
		} finally {
			setSubmitting(false);
		}
	};

	// DELETE
	const handleDelete = async (id) => {
		const center = collectionCenters.find((c) => c.id === id);
		if (!center) return;
		const confirmed = window.confirm(`Delete "${center.name}"?`);
		if (!confirmed) return;

		try {
			const ok = await deleteCenter(id);
			if (ok === true) {
				setCollectionCenters((prev) => prev.filter((c) => c.id !== id));
				if (editingId === id) cancelEdit();
			} else {
				await fetchCenters();
			}
		} catch (err) {
			console.error(err);
			alert("Failed to delete center. See console for details.");
		}
	};

	const getDirections = (center) => {
		if (center.location_url && center.location_url.trim() !== "") {
			window.open(center.location_url, "_blank");
		} else if (center.address) {
			const address = encodeURIComponent(center.address);
			window.open(`https://www.google.com/maps/search/${address}`, "_blank");
		} else {
			alert("No location available for this center.");
		}
	};

	// FILTER by company or location
	const filteredCenters = collectionCenters.filter(
		(c) =>
			c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
			c.address.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins">
			<div className="mb-4">
				<h1 className="text-[36px] font-lightbold text-[#355E62] mb-2">
					Collection Centers
				</h1>
				<p className="text-gray-500 text-[14px]">
					Manage your {collectionCenters.length} collection centers
				</p>
				<div className="mt-4 flex flex-col md:flex-row gap-2">
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search by location or company..."
						className="p-2 rounded border flex-1"
					/>
					<button onClick={openAdd} className={BUTTON_STYLE}>
						Add Center
					</button>
				</div>
			</div>

			{loading && <p className="text-gray-500">Loading centers…</p>}
			{error && <p className="text-red-500">{error}</p>}

			{/* ADD FORM */}
			{isAdding && (
				<form
					onSubmit={handleAdd}
					className="mb-6 bg-[#f7faf3] p-4 rounded-lg space-y-3"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input
							name="name"
							value={form.name}
							onChange={handleChange}
							placeholder="Name *"
							className="p-2 rounded border"
							required
						/>
						<input
							name="company"
							value={form.company}
							onChange={handleChange}
							placeholder="Company"
							className="p-2 rounded border"
						/>
						<input
							name="address"
							value={form.address}
							onChange={handleChange}
							placeholder="Address *"
							className="p-2 rounded border"
							required
						/>
						<input
							name="phone"
							value={form.phone}
							onChange={handleChange}
							placeholder="Phone"
							className="p-2 rounded border"
						/>
						<input
							name="hours"
							value={form.hours}
							onChange={handleChange}
							placeholder="Hours"
							className="p-2 rounded border"
						/>
						<input
							name="location_url"
							value={form.location_url}
							onChange={handleChange}
							placeholder="Google Maps URL"
							className="p-2 rounded border col-span-2"
						/>
					</div>

					<div className="flex justify-evenly items-center mt-2">
						<button type="submit" className={BUTTON_STYLE}>
							{submitting ? "Saving..." : "Save Center"}
						</button>
						<button type="button" onClick={cancelAdd} className={BUTTON_STYLE}>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* LIST */}
			<div className="space-y-4">
				{filteredCenters.length === 0 && !loading && (
					<p className="text-center text-gray-500">
						No collection centers found.
					</p>
				)}

				{filteredCenters.map((center) => (
					<div
						key={center.id}
						className="bg-[#ECF1E6] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
					>
						{editingId === center.id ? (
							<form onSubmit={saveEdit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<input
										name="name"
										value={form.name}
										onChange={handleChange}
										className="p-2 rounded border"
										required
									/>
									<input
										name="company"
										value={form.company}
										onChange={handleChange}
										className="p-2 rounded border"
									/>
									<input
										name="address"
										value={form.address}
										onChange={handleChange}
										className="p-2 rounded border"
										required
									/>
									<input
										name="phone"
										value={form.phone}
										onChange={handleChange}
										className="p-2 rounded border"
									/>
									<input
										name="hours"
										value={form.hours}
										onChange={handleChange}
										className="p-2 rounded border"
									/>
									<input
										name="location_url"
										value={form.location_url}
										onChange={handleChange}
										className="p-2 rounded border col-span-2"
										placeholder="Google Maps URL"
									/>
								</div>

								<div className="flex gap-3">
									<button type="submit" className={BUTTON_STYLE}>
										{submitting ? "Saving..." : "Save"}
									</button>
									<button type="button" onClick={cancelEdit} className={BUTTON_STYLE}>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<>
								<div className="mb-4">
									<h3 className="text-lg font-semibold text-gray-800 mb-1">
										{center.name}
									</h3>
									<p className="text-sm text-gray-600">{center.company}</p>
								</div>

								<div className="space-y-2 text-gray-600 text-sm">
									<div>📍 {center.address}</div>
									<div>📞 {center.phone}</div>
									<div>🕓 {center.hours}</div>
								</div>

								<div className="mt-4 flex gap-3">
									<button
										onClick={() => getDirections(center)}
										className={BUTTON_STYLE}
									>
										Get Directions
									</button>
									<button
										onClick={() => startEdit(center)}
										className={BUTTON_STYLE}
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(center.id)}
										className={BUTTON_STYLE}
									>
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
