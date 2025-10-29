"use client"
import React, { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Trophy, Users, Package, Leaf, Globe2 } from "lucide-react"

export default function CorporateAnalytics() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [monthlySubmissions, setMonthlySubmissions] = useState([])
  const [wasteTypeDistribution, setWasteTypeDistribution] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [advisory, setAdvisory] = useState("")

  useEffect(() => {
    // Load dummy data
    setMetrics({
      totalSubmissions: 1240,
      totalWeight: 3567, // kg
      co2Reduced: 1520, // kg
      pointsEarned: 75400,
    })

    setMonthlySubmissions([
      { month: "Jan", submissions: 120 },
      { month: "Feb", submissions: 150 },
      { month: "Mar", submissions: 180 },
      { month: "Apr", submissions: 200 },
      { month: "May", submissions: 220 },
      { month: "Jun", submissions: 250 },
      { month: "Jul", submissions: 210 },
      { month: "Aug", submissions: 240 },
      { month: "Sep", submissions: 260 },
      { month: "Oct", submissions: 270 },
    ])

    setWasteTypeDistribution([
      { name: "Plastic", value: 45 },
      { name: "Paper", value: 25 },
      { name: "Metal", value: 15 },
      { name: "Glass", value: 15 },
    ])

    setTopContributors([
      { name: "Company A", points: 15200 },
      { name: "Company B", points: 12800 },
      { name: "Company C", points: 10400 },
      { name: "Company D", points: 9500 },
    ])

    setAdvisory(
      "Based on the current recycling trends, increasing plastic collection by 10% can further reduce CO₂ emissions by approx. 150kg/month. Focus on community engagement programs to achieve this."
    )

    setLoading(false)
  }, [])

  const COLORS = ["#355E62", "#6EA9A5", "#A6C9C6", "#D1E2E1"]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]"></div>
    </div>
  )

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-white text-black text-poppins">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe2 className="text-[#355E62]" /> Corporate Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of company contributions and environmental impact
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#355E62] text-white rounded-xl p-6 shadow-lg flex flex-col items-start gap-2">
          <Users size={28} /> 
          <p className="text-sm opacity-80">Total Submissions</p>
          <p className="text-2xl font-semibold">{metrics.totalSubmissions}</p>
        </div>
        <div className="bg-[#6EA9A5] text-white rounded-xl p-6 shadow-lg flex flex-col items-start gap-2">
          <Package size={28} />
          <p className="text-sm opacity-80">Total Weight (kg)</p>
          <p className="text-2xl font-semibold">{metrics.totalWeight}</p>
        </div>
        <div className="bg-[#A6C9C6] text-white rounded-xl p-6 shadow-lg flex flex-col items-start gap-2">
          <Leaf size={28} />
          <p className="text-sm opacity-80">CO₂ Reduced (kg)</p>
          <p className="text-2xl font-semibold">{metrics.co2Reduced}</p>
        </div>
        <div className="bg-[#D1E2E1] text-black rounded-xl p-6 shadow-lg flex flex-col items-start gap-2">
          <Trophy size={28} />
          <p className="text-sm opacity-80">Points Earned</p>
          <p className="text-2xl font-semibold">{metrics.pointsEarned}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Monthly Submissions */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Monthly Submissions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySubmissions}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#355E62" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Waste Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Waste Type Distribution (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={wasteTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {wasteTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Top Contributors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topContributors.map((c, idx) => (
            <div key={idx} className="bg-[#F8FAF8] p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start gap-2">
              <p className="text-sm opacity-70">#{idx + 1}</p>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">{c.points} points</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory / Insights */}
      <div className="bg-[#F9FBF9] border border-gray-200 rounded-xl p-6 shadow-inner">
        <h3 className="text-xl font-semibold mb-2">Advisory & Insights</h3>
        <p className="text-gray-700 leading-relaxed">{advisory}</p>
      </div>
    </div>
  )
}
