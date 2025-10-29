"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Trophy, Users, Package, Leaf, Globe2 } from "lucide-react";
import apiService from "../lib/apiService";

export default function CorporateAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [monthlySubmissions, setMonthlySubmissions] = useState([]);
  const [wasteTypeDistribution, setWasteTypeDistribution] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [advisory, setAdvisory] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 🔹 Get all uploads from the backend
        const uploads = await apiService.getAllUploads();
        if (!uploads?.length) throw new Error("No uploads found");

        const totalSubmissions = uploads.length;
        const totalWeight = uploads.reduce((sum, u) => sum + (u.weight || 0), 0);
        const co2Reduced = Math.round(totalWeight * 0.42); // sample factor
        const pointsEarned = uploads.reduce((sum, u) => sum + (u.points_awarded || 0), 0);

        // Monthly distribution (based on upload_date)
        const monthlyMap = {};
        uploads.forEach((u) => {
          const month = new Date(u.upload_date).toLocaleString("default", { month: "short" });
          monthlyMap[month] = (monthlyMap[month] || 0) + 1;
        });
        const monthlyData = Object.entries(monthlyMap).map(([month, submissions]) => ({ month, submissions }));

        // Waste type distribution (category)
        const typeMap = {};
        uploads.forEach((u) => {
          const type = u.category || "Unknown";
          typeMap[type] = (typeMap[type] || 0) + 1;
        });
        const wasteTypes = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

        // Placeholder top contributors (aggregated points by user)
        const userMap = {};
        uploads.forEach((u) => {
          if (!u.user_id) return;
          userMap[u.user_id] = (userMap[u.user_id] || 0) + (u.points_awarded || 0);
        });
        const topUsers = Object.entries(userMap)
          .map(([name, points]) => ({ name: `User ${name}`, points }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 4);

        setMetrics({ totalSubmissions, totalWeight, co2Reduced, pointsEarned });
        setMonthlySubmissions(monthlyData);
        setWasteTypeDistribution(wasteTypes);
        setTopContributors(topUsers);
       setAdvisory(`
The Importance of Recycling in Combating Climate Change (Guided by SDG 13).
Recycling plays a crucial role in addressing one of the world’s most pressing challenges — climate change. Every product we consume requires energy and natural resources to produce. When we discard these products carelessly, they often end up in landfills or incinerators, releasing harmful greenhouse gases such as methane and carbon dioxide into the atmosphere. Recycling reduces this environmental burden by conserving resources, minimizing energy use in production, and lowering overall emissions. By giving materials a second life, we slow down the rate at which new raw materials are extracted from the earth, protecting ecosystems and reducing deforestation.
Guided by Sustainable Development Goal (SDG) 13: Climate Action, recycling becomes more than a personal habit — it is a global responsibility. SDG 13 calls for urgent action to combat climate change and its impacts, emphasizing sustainable practices that reduce human pressure on the environment. Recycling aligns perfectly with this goal, as it cuts down waste, lowers industrial emissions, and encourages sustainable consumption patterns. It also supports other SDGs, such as SDG 12 (Responsible Consumption and Production) and SDG 15 (Life on Land), by promoting environmental stewardship.
Moreover, recycling fosters innovation and green job creation. As nations move toward circular economies, industries that rely on recycled materials — from packaging to construction — experience new growth opportunities. Communities can also benefit economically from well-managed recycling systems, which create employment in waste collection, sorting, and material processing. This shift toward sustainability not only protects the planet but also empowers people to participate in climate action through their everyday choices.
In conclusion, recycling is a simple yet powerful way for individuals, organizations, and governments to contribute to climate action under SDG 13. By rethinking how we manage waste, we can reduce pollution, conserve resources, and build a cleaner, more resilient planet. Every recycled item counts toward a sustainable future — one where economic growth and environmental protection coexist in balance for generations to come.
`);

      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ["#355E62", "#6EA9A5", "#A6C9C6", "#D1E2E1"];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]"></div>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-white text-black text-poppins">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe2 className="text-[#355E62]" /> Corporate Analytics Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Real-time overview of recycling performance and impact
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#355E62] text-white rounded-xl p-6 shadow-lg">
            <Users size={28} />
            <p className="text-sm opacity-80">Total Submissions</p>
            <p className="text-2xl font-semibold">{metrics.totalSubmissions}</p>
          </div>
          <div className="bg-[#6EA9A5] text-white rounded-xl p-6 shadow-lg">
            <Package size={28} />
            <p className="text-sm opacity-80">Total Weight (kg)</p>
            <p className="text-2xl font-semibold">{metrics.totalWeight}</p>
          </div>
          <div className="bg-[#A6C9C6] text-white rounded-xl p-6 shadow-lg">
            <Leaf size={28} />
            <p className="text-sm opacity-80">CO₂ Reduced (kg)</p>
            <p className="text-2xl font-semibold">{metrics.co2Reduced}</p>
          </div>
          <div className="bg-[#D1E2E1] text-black rounded-xl p-6 shadow-lg">
            <Trophy size={28} />
            <p className="text-sm opacity-80">Points Earned</p>
            <p className="text-2xl font-semibold">{metrics.pointsEarned}</p>
          </div>
        </div>
      )}

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

      {/* Advisory */}
      <div className="bg-[#F9FBF9] border border-gray-200 rounded-xl p-6 shadow-inner">
        <h3 className="text-xl font-semibold mb-2">Advisory & Insights</h3>
        <p className="text-gray-700 leading-relaxed">{advisory}</p>
      </div>
    </div>
  );
}
