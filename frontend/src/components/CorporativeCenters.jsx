import React, { useState } from "react";

export default function CorporativeCenters() {
	const [collectionCenters, setCollectionCenters] = useState([
		{
			id: 1,
			name: "Safaricom E-Waste CBD",
			company: "Safaricom PLC",
			address: "Kenyatta Ave, Nairobi CBD",
			phone: "+254 722 000 000",
			hours: "Mon - Fri: 8:00 AM - 5:00 PM",
		},
		{
			id: 2,
			name: "Safaricom E-Waste CBD",
			company: "Safaricom PLC",
			address: "Kenyatta Ave, Nairobi CBD",
			phone: "+254 722 000 000",
			hours: "Mon - Fri: 8:00 AM - 5:00 PM",
		},
		{
			id: 3,
			name: "Safaricom E-Waste CBD",
			company: "Safaricom PLC",
			address: "Kenyatta Ave, Nairobi CBD",
			phone: "+254 722 000 000",
			hours: "Mon - Fri: 8:00 AM - 5:00 PM",
		},
	]);

	// UI state
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState(null);

	// shared form state (used for both add & edit)
	const [form, setForm] = useState({
		name: "",
		company: "",
		address: "",
		phone: "",
		hours: "",
	});

	const BUTTON_STYLE =
		"w-[132px] h-[32px] bg-[#355E62] rounded-[64px] text-[#ffff] hover:cursor-pointer font-poppins text-[14px] font-light";

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
	};

	// ADD
	const openAdd = () => {
		setForm({ name: "", company: "", address: "", phone: "", hours: "" });
		setIsAdding(true);
		setEditingId(null);
	};
	const cancelAdd = () => {
		setIsAdding(false);
		setForm({ name: "", company: "", address: "", phone: "", hours: "" });
	};
	const handleAdd = (e) => {
		e.preventDefault();
		if (!form.name.trim() || !form.address.trim()) {
			alert("Please provide at least a name and address for the center.");
			return;
		}
		const newCenter = { ...form, id: Date.now() };
		setCollectionCenters((prev) => [newCenter, ...prev]);
		cancelAdd();
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
		});
	};
	const cancelEdit = () => {
		setEditingId(null);
		setForm({ name: "", company: "", address: "", phone: "", hours: "" });
	};
	const saveEdit = (e) => {
		e.preventDefault();
		if (!form.name.trim() || !form.address.trim()) {
			alert("Please provide at least a name and address.");
			return;
		}
		setCollectionCenters((prev) =>
			prev.map((c) => (c.id === editingId ? { ...c, ...form } : c)),
		);
		cancelEdit();
	};

	// DELETE
	const handleDelete = (id) => {
		const center = collectionCenters.find((c) => c.id === id);
		if (!center) return;
		const confirmed = window.confirm(
			`Delete "${center.name}"? This cannot be undone.`,
		);
		if (!confirmed) return;
		setCollectionCenters((prev) => prev.filter((c) => c.id !== id));
		if (editingId === id) cancelEdit();
	};

	return (
		<div className="w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins">
			{/* Header Section */}
			<div className="mb-4">
				<h1 className="text-[36px] font-lightbold text-[#355E62] mb-2">
					Collection Centers
				</h1>
				<p className="text-gray-500 text-[14px]">
					Manage your {collectionCenters.length} collection centers
				</p>

				{/* ADD BUTTON placed after the manage line (per your request) */}
				<div className="mt-4">
					<button onClick={openAdd} className={BUTTON_STYLE}>
						Add Center
					</button>
				</div>
			</div>

			{/* Inline Add Form */}
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
					</div>

					<div className="flex justify-evenly items-center mt-2">
						<button type="submit" className={BUTTON_STYLE}>
							Save Center
						</button>
						<button type="button" onClick={cancelAdd} className={BUTTON_STYLE}>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* Collection Centers Grid */}
			<div className="space-y-4">
				{collectionCenters.map((center) => (
					<div
						key={center.id}
						className="bg-[#ECF1E6] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
					>
						{/* If editing this center, show edit form inline */}
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
								</div>

								<div className="flex gap-3">
									<button type="submit" className={BUTTON_STYLE}>
										Save
									</button>
									<button
										type="button"
										onClick={cancelEdit}
										className={BUTTON_STYLE}
									>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<>
								{/* Center Name and Company */}
								<div className="mb-4">
									<h3 className="text-lg font-semibold text-gray-800 mb-1">
										{center.name}
									</h3>
									<p className="text-sm text-gray-600">{center.company}</p>
								</div>

								{/* Contact Information */}
								<div className="space-y-2">
									{/* Address */}
									<div className="flex items-center text-gray-600">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-sm">{center.address}</span>
									</div>

									{/* Phone */}
									<div className="flex items-center text-gray-600">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
										</svg>
										<span className="text-sm">{center.phone}</span>
									</div>

									{/* Hours */}
									<div className="flex items-center text-gray-600">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-sm">{center.hours}</span>
									</div>

									{/* Action buttons (styled with your provided tailwind) */}
									<div className="mt-4 flex gap-3">
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
								</div>
							</>
						)}
					</div>
				))}

				{collectionCenters.length === 0 && (
					<p className="text-center text-gray-500">
						No collection centers available.
					</p>
				)}
			</div>
		</div>
	);
}
