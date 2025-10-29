"use client"
import React, { useState, useEffect } from "react"
import { getCurrentUser, uploadProfileImage } from "../lib/user"
import { jsPDF } from "jspdf"
import {
  Download,
  Upload,
  Leaf,
  Award,
  Globe2,
  Recycle,
} from "lucide-react"

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null)
  const [impactStats, setImpactStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [adviceText, setAdviceText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch user profile and load mock data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser()
        setUserProfile(data)
      } catch (err) {
        console.error(err)
        setError(err?.response?.data?.error || "Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
    loadMockStats()
    loadMockAchievements()
    generateKenyaAdvisory()
  }, [])

  // Mock environmental stats
  const loadMockStats = () => {
    setImpactStats({
      totalSubmissions: 4,
      totalWeight: 4.5,
      co2Reduced: "2.1kg",
      pointsEarned: 250,
      rank: "Eco Warrior",
    })
  }

  // Mock achievements
  const loadMockAchievements = () => {
    setAchievements([
      { id: 1, title: "First Submission", description: "Made your first waste submission", earned: true, date: "2025-09-15" },
      { id: 2, title: "Plastic Warrior", description: "Submitted 10kg of plastic waste", earned: true, date: "2025-10-10" },
    ])
  }

  // Advisory text
  const generateKenyaAdvisory = () => {
    const text = `
ENVIRONMENTAL ADVISORY FOR KENYA: CLIMATE ACTION & LIFE BELOW WATER

Kenya is at the frontline of climate change, experiencing the impacts of prolonged droughts, unpredictable rainfall, floods, rising sea levels, and the increasing prevalence of plastic and chemical pollution. These challenges not only affect ecosystems but also threaten livelihoods, food security, and public health. From the arid lands of Turkana to the lush coastal mangroves of Lamu, the impacts of climate change are being felt across every region. However, every Kenyan, from rural farmers to urban youth, can contribute to climate action and environmental restoration through deliberate, everyday choices.

1. CLIMATE ACTION (SDG 13)

Climate change is primarily driven by greenhouse gas emissions. In Kenya, transportation, energy production, deforestation, and inefficient waste management contribute significantly to carbon output. Individual and community actions can help reduce these emissions while building resilience to climate impacts.
- Waste Management: Proper separation and recycling of plastics, organics, metals, and glass is a critical first step. Organic waste can be composted to enrich soils, while plastics and metals can be repurposed or sold to recycling centers, reducing landfill methane emissions. County-level recycling initiatives and community collection points are excellent ways to participate in responsible waste management.
- Clean Energy Adoption: Solar energy and biogas are practical and increasingly affordable ways for Kenyan households and communities to reduce dependence on fossil fuels. Installing solar panels for lighting, water heating, or small appliances can significantly lower your household carbon footprint, while biogas from organic waste can provide clean cooking fuel.
- Transportation Choices: Reducing vehicle emissions is another crucial action. Walking, cycling, using public transport, or carpooling minimizes fuel consumption and urban air pollution. For longer journeys, electric or hybrid vehicles can offer sustainable alternatives as infrastructure develops.
- Tree Planting and Green Infrastructure: Trees act as carbon sinks, reduce urban heat, prevent soil erosion, and improve air quality. Participating in tree-planting drives or creating community gardens strengthens both ecological and social resilience. Supporting climate-smart agriculture???like crop rotation, drought-resistant crops, and soil conservation???helps farmers adapt to changing weather patterns while reducing emissions.

2. LIFE BELOW WATER (SDG 14)

Kenya???s rivers, lakes, and coastal waters are vital for biodiversity, fisheries, and livelihoods. Protecting these ecosystems is essential for climate resilience and food security.
- Preventing Water Pollution: Avoid dumping waste into rivers, drainage systems, or directly into the ocean. Plastic and chemical waste degrade marine habitats, threaten wildlife, and accumulate toxins in the food chain.
- Reducing Single-Use Plastics: Substituting reusable bags, bottles, and packaging reduces pollution reaching waterways. Encourage local businesses to adopt eco-friendly alternatives.
- Mangrove and Wetland Conservation: Mangroves act as natural buffers against coastal erosion, trap carbon, and provide nursery habitats for fish. Support mangrove restoration programs along the Kenyan coast and wetland conservation efforts inland.
- Community Cleanups: Participate in coastal, river, and lake cleanups in cities like Mombasa, Lamu, and Kisumu. These activities raise awareness, reduce pollution, and protect both aquatic life and human communities.

3. BUILDING LOCAL CLIMATE RESILIENCE

Climate resilience begins at the community level. Educating family members, neighbors, and local leaders about sustainable practices multiplies the impact of individual actions.
- Organic Waste Composting and Rainwater Harvesting: Transforming organic waste into compost reduces landfill methane emissions while enriching soils. Collecting and storing rainwater ensures availability during dry seasons and reduces pressure on municipal water systems.
- Circular Economy Practices: Repairing, reusing, and repurposing items reduces resource extraction and landfill waste. Encourage local businesses and schools to participate in material recovery initiatives.
- Supporting Green Enterprises: Youth and women-led startups focusing on sustainable products, renewable energy, and eco-friendly solutions strengthen local economies while advancing climate action.

4. THE KENYAN CLIMATE PLEDGE

By aligning with SDG 13 and its related goals, every Kenyan can contribute to a sustainable future. Collective actions include:
- Reducing pollution and carbon emissions through responsible energy use, transport choices, and waste management.
- Protecting rivers, lakes, and oceans to preserve biodiversity and fisheries.
- Restoring degraded ecosystems from Turkana to the coastal mangroves.
- Promoting cleaner, smarter, and sustainable cities through green infrastructure and urban planning.

Together, these efforts can position Kenya as a leader in climate resilience within Africa. Each small action???planting a tree, recycling waste, conserving energy, educating others???multiplies across communities, creating meaningful change.
Every Kenyan can be a climate champion. Protecting our land, water, and atmosphere today ensures a healthier, more resilient future for generations to come. Let us unite in making Kenya cleaner, greener, and climate-smart.

Eco-Collect Initiative
`
    setAdviceText(text)
  }

  // Handle avatar upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)

    try {
      // Upload the raw file directly
      await uploadProfileImage(file)
      // Refresh user profile after upload
      const updated = await getCurrentUser()
      setUserProfile(updated)
    } catch (err) {
      console.error(err)
      alert("Failed to upload image.")
    } finally {
      setUploadingImage(false)
    }
  }

  // Download advisory as PDF
  const handleDownloadAdvisory = () => {
    const doc = new jsPDF()
    doc.setFont("Helvetica", "normal")
    doc.setFontSize(12)
    const pageHeight = doc.internal.pageSize.height
    const margin = 15
    const lineHeight = 7
    let y = margin

    const lines = doc.splitTextToSize(adviceText, 180)
    lines.forEach(line => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    doc.save("Kenya_Environmental_Advisory.pdf")
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]"></div>
    </div>
  )

  if (error) return (
    <div className="text-center text-red-600 py-8">
      <p>{error}</p>
    </div>
  )

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white text-black text-poppins">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <Globe2 className="text-[#355E62]" /> Profile Information
        </h1>
        <p className="text-gray-500 mt-1">Your account details and contribution to Kenya???s sustainability</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-10 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 bg-[#355E62] rounded-full flex items-center justify-center text-white text-3xl font-semibold overflow-hidden shadow-sm">
            <img
              src={userProfile?.avatar || "/avatar.png"}
              alt={userProfile?.name || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <label className="absolute bottom-1 right-1 bg-[#355E62] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#2a4a4e] transition-all shadow-md">
            {uploadingImage ? <span className="text-xs px-1">...</span> : <Upload size={16} />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-800">{userProfile?.name}</h2>
          <p className="text-sm text-gray-600">{userProfile?.email}</p>
          <p className="text-sm text-gray-600">Member since {userProfile?.memberSince}</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Award className="text-[#355E62]" /> Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div key={ach.id} className={`p-4 rounded-xl border transition-all ${ach.earned ? "bg-[#355E62] border-[#355E62] text-white shadow-lg" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <h4 className="font-semibold text-sm mb-1">{ach.title}</h4>
              <p className="text-xs opacity-90">{ach.description}</p>
              {ach.earned && <p className="text-xs mt-2 opacity-75">Earned {ach.date}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-[#F8FAF8] rounded-xl border border-gray-200 p-6 mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Recycle className="text-[#355E62]" /> Environmental Impact
        </h3>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            By recycling <span className="font-medium text-[#355E62]">{impactStats?.totalWeight}</span>, you've helped reduce <span className="font-medium text-[#355E62]">{impactStats?.co2Reduced}</span> CO??? emissions ??? a strong contribution to Kenya???s climate action goals.
          </p>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="bg-[#F9FBF9] border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Leaf className="text-[#355E62]" /> Environmental Advisory Lesson
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto text-sm border border-gray-100 rounded-lg p-4 bg-white shadow-inner">
          {adviceText}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleDownloadAdvisory} className="flex items-center gap-2 px-5 py-1 bg-[#355E62] text-white rounded-[64px] font-medium hover:bg-[#2a4a4e] transition-all shadow-md">
            <Download size={18} /> Download Advisory (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}