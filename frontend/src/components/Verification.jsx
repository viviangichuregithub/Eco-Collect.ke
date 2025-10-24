// import React, { useState, useMemo } from "react";

// export default function Verification() {
//   const centres = [
//     { id: 1, name: "Coca-Cola Westlands Collection Center" },
//     { id: 2, name: "Safaricom E-Waste CBD" },
//     { id: 3, name: "Safaricom E-Waste Thika" },
//   ];
//   const getCentreName = (id) => centres.find((c) => c.id === id)?.name ?? `Centre #${id}`;

//   const [uploads, setUploads] = useState([
//     {
//       id: 201,
//       user_id: 11,
//       user_name: "John Kamau",
//       weight: 1200,
//       points_awarded: 12,
//       category: "Plastic Bottle",
//       filename_url: "/Card.png",
//       centre_id: 1,
//       not_verified: true,
//       upload_date: "2025-05-01T09:15:00Z",
//     },
//     {
//       id: 202,
//       user_id: 12,
//       user_name: "Alice Ng'ang'a",
//       weight: 800,
//       points_awarded: 8,
//       category: "Glass Jar",
//       filename_url: "/Card.png",
//       centre_id: 1,
//       not_verified: true,
//       upload_date: "2025-06-01T10:00:00Z",
//     },
//     {
//       id: 203,
//       user_id: 13,
//       user_name: "Peter O.",
//       weight: 400,
//       points_awarded: 4,
//       category: "Aluminium Can",
//       filename_url: "/Card.png",
//       centre_id: 2,
//       not_verified: true,
//       upload_date: "2025-07-01T11:45:00Z",
//     },
//     {
//       id: 204,
//       user_id: 14,
//       user_name: "David",
//       weight: 600,
//       points_awarded: 6,
//       category: "Plastic Bottle",
//       filename_url: "/Card.png",
//       centre_id: 3,
//       not_verified: true,
//       upload_date: "2025-08-03T09:20:00Z",
//     },
//     {
//       id: 205,
//       user_id: 15,
//       user_name: "Mary",
//       weight: 500,
//       points_awarded: 5,
//       category: "Paper",
//       filename_url: "/Card.png",
//       centre_id: 2,
//       not_verified: true,
//       upload_date: "2025-04-20T08:00:00Z",
//     },
//   ]);

//   const pendingCount = useMemo(() => uploads.filter((u) => u.not_verified).length, [uploads]);

//   const toShow = useMemo(() => {
//     return uploads
//       .filter((u) => u.not_verified)
//       .sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date))
//       .slice(0, 4); // limit 4
//   }, [uploads]);

//   const formatDate = (iso) => {
//     try {
//       const d = new Date(iso);
//       return d.toLocaleString(undefined, {
//         day: "2-digit",
//         month: "short",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return iso;
//     }
//   };

//   const verifyUpload = (id) => {
//     setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, not_verified: false } : u)));
//   };

//   const rejectUpload = (id) => {
//     const u = uploads.find((x) => x.id === id);
//     if (!u) return;
//     if (!window.confirm(`Reject upload #${id} by ${u.user_name}?`)) return;
//     setUploads((prev) => prev.map((x) => (x.id === id ? { ...x, not_verified: false } : x)));
//   };

//   // small label+value block: label on top (small), value below (bolder)
//   const InfoBlock = ({ label, value }) => (
//     <div className="flex flex-col text-sm text-gray-600">
//       <span className="text-xs text-gray-400">{label}</span>
//       <span className="mt-1 text-sm text-gray-800">{value}</span>
//     </div>
//   );

//   return (
//     <div className="w-full max-w-6xl mx-auto p-8 bg-white text-black text-poppins">
//       <div className="mb-6">
//         <h1 className="text-[36px] font-lightbold text-[#355E62] mb-2">Verification</h1>
//         <p className="text-gray-500 text-[14px]">{pendingCount} pending drop request(s).</p>
//       </div>

//       {/* GRID: rows of cards, up to 4 per row on large screens */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {toShow.length === 0 && (
//           <div className="p-6 rounded-2xl bg-[#f3f7f4] border border-gray-100 text-gray-600">
//             No pending uploads to verify.
//           </div>
//         )}

//         {toShow.map((u) => (
//           <article
//             key={u.id}
//             className="bg-[#EEF6EE] border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col"
//             style={{ minHeight: 380 }}
//           >
//             {/* Header: category (line 1) and centre (line 2) */}
//             <header className="mb-3">
//               <h2 className="text-base font-medium text-gray-800">{u.category}</h2>
//               <p className="text-sm text-gray-500 mt-1">{getCentreName(u.centre_id)}</p>
//             </header>

//             {/* Image */}
//             <div className="mb-3 rounded overflow-hidden flex-shrink-0">
//               <img
//                 src={u.filename_url}
//                 alt={`${u.category} upload ${u.id}`}
//                 className="w-full h-[150px] object-cover rounded-md shadow-sm"
//               />
//             </div>

//             {/* Info blocks arranged vertically (label above, value below) */}
//             <div className="mt-2 flex-1 flex flex-col justify-between">
//               <div className="grid grid-cols-1 gap-3">
//                 <InfoBlock label="User" value={u.user_name} />
//                 <InfoBlock
//                   label="Weight"
//                   value={(u.weight / 1000) >= 1 ? `${(u.weight / 1000).toFixed(1)} kg` : `${u.weight} g`}
//                 />
//                 <InfoBlock label="Uploaded" value={formatDate(u.upload_date)} />
//               </div>

//               {/* Actions row aligned bottom-right */}
//               <div className="mt-4 flex gap-3 justify-end">
//                 <button
//                   onClick={() => rejectUpload(u.id)}
//                   className="px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 text-sm"
//                 >
//                   Reject
//                 </button>

//                 <button
//                   onClick={() => verifyUpload(u.id)}
//                   className="px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 text-sm"
//                 >
//                   Verify
//                 </button>
//               </div>
//             </div>
//           </article>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useState, useMemo } from "react";

/**
 * Verification — icon-only labels, fixed card size, fixed button size
 * - cards: 340px width, 396px height
 * - buttons: 72.15px width, 21.59px height
 * - shows up to 4 not_verified uploads (oldest first)
 */
export default function Verification() {
	const centres = [
		{ id: 1, name: "Coca-Cola Westlands Collection Center" },
		{ id: 2, name: "Safaricom E-Waste CBD" },
		{ id: 3, name: "Safaricom E-Waste Thika" },
	];
	const getCentreName = (id) =>
		centres.find((c) => c.id === id)?.name ?? `Centre #${id}`;

	const [uploads, setUploads] = useState([
		{
			id: 201,
			user_id: 11,
			user_name: "John Kamau",
			weight: 1200,
			points_awarded: 12,
			category: "Plastic Bottle",
			filename_url: "/Card.png",
			centre_id: 1,
			not_verified: true,
			upload_date: "2025-05-01T09:15:00Z",
		},
		{
			id: 202,
			user_id: 12,
			user_name: "Alice Ng'ang'a",
			weight: 800,
			points_awarded: 8,
			category: "Glass Jar",
			filename_url: "/Card.png",
			centre_id: 1,
			not_verified: true,
			upload_date: "2025-06-01T10:00:00Z",
		},
		{
			id: 203,
			user_id: 13,
			user_name: "Peter O.",
			weight: 400,
			points_awarded: 4,
			category: "Aluminium Can",
			filename_url: "/Card.png",
			centre_id: 2,
			not_verified: true,
			upload_date: "2025-07-01T11:45:00Z",
		},
		{
			id: 204,
			user_id: 14,
			user_name: "David",
			weight: 600,
			points_awarded: 6,
			category: "Plastic Bottle",
			filename_url: "/Card.png",
			centre_id: 3,
			not_verified: true,
			upload_date: "2025-08-03T09:20:00Z",
		},
		{
			id: 205,
			user_id: 15,
			user_name: "Mary",
			weight: 500,
			points_awarded: 5,
			category: "Paper",
			filename_url: "/Card.png",
			centre_id: 2,
			not_verified: true,
			upload_date: "2025-04-20T08:00:00Z",
		},
	]);

	const pendingCount = useMemo(
		() => uploads.filter((u) => u.not_verified).length,
		[uploads],
	);

	const toShow = useMemo(() => {
		return uploads
			.filter((u) => u.not_verified)
			.sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date))
			.slice(0, 4);
	}, [uploads]);

	const formatDate = (iso) => {
		try {
			const d = new Date(iso);
			return d.toLocaleString(undefined, {
				day: "2-digit",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return iso;
		}
	};

	const verifyUpload = (id) => {
		setUploads((prev) =>
			prev.map((u) => (u.id === id ? { ...u, not_verified: false } : u)),
		);
	};

	const rejectUpload = (id) => {
		const u = uploads.find((x) => x.id === id);
		if (!u) return;
		if (!window.confirm(`Reject upload #${id} by ${u.user_name}?`)) return;
		setUploads((prev) =>
			prev.map((x) => (x.id === id ? { ...x, not_verified: false } : x)),
		);
	};

	/* ICONS */
	const IconUser = ({ className = "" }) => (
		<svg
			aria-hidden
			viewBox="0 0 24 24"
			className={`w-3 h-3 ${className}`}
			fill="none"
			stroke="currentColor"
		>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
			/>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M4 21c0-3.866 3.582-7 8-7s8 3.134 8 7"
			/>
		</svg>
	);
	const IconWeight = ({ className = "" }) => (
		<svg
			aria-hidden
			viewBox="0 0 24 24"
			className={`w-3 h-3 ${className}`}
			fill="none"
			stroke="currentColor"
		>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 6h18"
			/>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M8 6v10a4 4 0 004 4 4 4 0 004-4V6"
			/>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 10v4"
			/>
		</svg>
	);
	const IconClock = ({ className = "" }) => (
		<svg
			aria-hidden
			viewBox="0 0 24 24"
			className={`w-3 h-3 ${className}`}
			fill="none"
			stroke="currentColor"
		>
			<circle
				cx="12"
				cy="12"
				r="9"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 7v6l4 2"
			/>
		</svg>
	);

	// Info block with icon on top line and value below (two-line)
	const InfoIconBlock = ({ Icon, value, ariaLabel }) => (
		<div className="flex flex-col items-center text-center">
			{/* icon as top line; include aria-label for screen readers */}
			<div aria-hidden className="mb-2  text-gray-600">
				<Icon />
			</div>
			{/* value below */}
			<div className="text-sm text-gray-800">{value}</div>
			{/* visually-hidden accessible label for screen readers */}
			<span className="sr-only" aria-label={ariaLabel}></span>
		</div>
	);

	const BUTTON_FIXED =
		"w-[72.15px] h-[21.59px] flex items-center justify-center text-xs rounded-full text-white";

	return (
		<div className="w-full max-w-6xl mx-auto p-8 bg-white text-black text-poppins">
			<div className="mb-6">
				<h1 className="text-[36px] font-lightbold text-[#355E62] mb-2">
					Verification
				</h1>
				<p className="text-gray-500 text-[14px]">
					{pendingCount} pending drop request(s).
				</p>
			</div>

			<div className="flex  gap-6 justify-items-center ">
				{toShow.length === 0 && (
					<div className="p-6 rounded-2xl bg-[#f3f7f4] border border-gray-100 text-gray-600">
						No pending uploads to verify.
					</div>
				)}

				{toShow.map((u) => (
					<article
						key={u.id}
						className="bg-[#EEF6EE] border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col w-[340px] h-auto"
						style={{ width: 340 }}
					>
						{/* Header */}
						<header className="mb-3">
							<h2 className="text-base font-medium text-gray-800">
								{u.category}
							</h2>
							<p className="text-sm text-gray-500 mt-1">
								{getCentreName(u.centre_id)}
							</p>
						</header>

						{/* Image */}
						<div className="mb-3 rounded overflow-hidden flex-shrink-0">
							<img
								src={u.filename_url}
								alt={`${u.category} upload ${u.id}`}
								className="w-full h-[150px] object-cover rounded-md shadow-sm"
							/>
						</div>

						{/* Info row: icons on top of values; arranged horizontally */}
						<div className="mt-2 flex-1 flex flex-col justify-between">
							<div className="flex-row justify-start items-start gap-4">
								<InfoIconBlock
									Icon={() => <IconUser className="text-gray-600 " />}
									value={u.user_name}
									ariaLabel="User"
								/>
								<InfoIconBlock
									Icon={() => <IconWeight className="text-gray-600" />}
									value={
										u.weight / 1000 >= 1
											? `${(u.weight / 1000).toFixed(1)} kg`
											: `${u.weight} g`
									}
									ariaLabel="Weight"
								/>
								<InfoIconBlock
									Icon={() => <IconClock className="text-gray-600 w-3 h-3 " />}
									value={formatDate(u.upload_date)}
									ariaLabel="Uploaded"
								/>
							</div>

							{/* Actions aligned to bottom-right */}
							<div className="mt-4 flex gap-3 justify-between">
								<button
									onClick={() => rejectUpload(u.id)}
									className={`${BUTTON_FIXED} bg-[#CC0D0D]`}
									aria-label={`Reject upload ${u.id}`}
								>
									Reject
								</button>

								<button
									onClick={() => verifyUpload(u.id)}
									className={`${BUTTON_FIXED} bg-[#355e62]`}
									aria-label={`Verify upload ${u.id}`}
								>
									Verify
								</button>
							</div>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}
