"use client"
import React, { useState, useEffect } from "react"
import { listCenters } from "../lib/centers"

export default function CorporativeCenters() {
  const [collectionCenters, setCollectionCenters] = useState([])
  const [originalCenters, setOriginalCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const BUTTON_STYLE =
    "px-4 py-2 bg-[#355E62] text-white rounded-full text-sm hover:bg-[#2a4a4e]"

  // Load centers
  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCenters()
      const validCenters = Array.isArray(data)
        ? data
            .map((c) => ({
              id: c.id,
              name: c.name || c.location_name || "",
              company: c.company || "",
              address: c.location || "",
              phone: c.contact || "",
              hours: c.time_open || "",
              location_url: c.location_url || "",
            }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        : []
      setOriginalCenters(validCenters)
      setCollectionCenters(validCenters)
    } catch (err) {
      console.error(err)
      setError("Unable to load centers.")
    } finally {
      setLoading(false)
    }
  }

  // Filter centers by search term
  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const filtered = originalCenters.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
    )
    setCollectionCenters(filtered)
  }, [searchTerm, originalCenters])

  const getDirections = (center) => {
    if (center.location_url?.trim()) window.open(center.location_url, "_blank")
    else if (center.address)
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(
          center.address
        )}`,
        "_blank"
      )
    else alert("No location available.")
  }

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-600 text-lg">
        Loading collection centers...
      </p>
    )

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white text-black">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, company, or address..."
          className="p-3 border border-gray-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-[#355E62]"
        />
        <div className="text-sm text-gray-600 mt-2 md:mt-0">
          {collectionCenters.length} centers found
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {collectionCenters.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No centers found.
          </p>
        ) : (
          collectionCenters.map((center) => (
            <div
              key={center.id}
              className="bg-[#ECF1E6] rounded-lg p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {center.name}
                </h3>
                <p className="text-sm text-gray-600">{center.company}</p>
                <p className="text-sm text-gray-700 mt-1">📍 {center.address}</p>
                <p className="text-sm text-gray-700">📞 {center.phone}</p>
                <p className="text-sm text-gray-700">🕓 {center.hours}</p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => getDirections(center)}
                  className={BUTTON_STYLE}
                >
                  Get Directions
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
