"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Logo from "../Logo.svg"
import Nav from "../../components/CivilianNavBar"
import { useAuth } from "../../context/AuthContext"

export default function Page() {
  const { user, loading, logout: authLogout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth")
    }
  }, [user, loading, router])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <div className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await authLogout()
      router.replace("/auth") 
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <div className="w-[100dvw] h-[100dvh] flex items-center justify-start flex-col text-white text-poppins">
      <div className="titleElement flex flex-row items-center justify-center mb-[20px] w-full h-[90px] bg-[#ECF1E6] px-2 py-4">
        <div className="orgLogo flex flex-col justify-center ml-4">
          <Image
            src={Logo}
            alt="EcoCollect Logo"
            width={180}
            height={60}
            className="object-contain"
          />
          {user && (
            <h4 className="text-[#717182] text-[16px] font-medium mt-1">
              Welcome, {user.user_name}
            </h4>
          )}
        </div>

        <div className="pointCard bg-[#FCFEF7] text-black flex flex-col w-40 h-16 border-[1px] border-gray-300 px-2 py-2 ml-auto mr-2 shadow-[rgba(0,0,0,0.12)0px 1px 3px, rgba(0,0,0,0.24)0px 1px 2px]">
          <h4 className="text-[14px] font-light">Points Balance</h4>
          <h2 className="text-[18px] font-semibold">{user?.point_score || 0}</h2>
        </div>

        <button
          onClick={handleLogout}
          className="logoutButton bg-[#FCFEF7] rounded-[64px] mt-[10px] w-[102px] h-[36px] text-black text-[16px] font-medium flex items-center justify-center mr-4 shadow-[rgba(0,0,0,0.12)0px 1px 3px, rgba(0,0,0,0.24)0px 1px 2px]"
        >
          Logout
        </button>
      </div>

      <div className="mainContentArea flex flex-col items-center justify-start w-full h-[calc(676px)] bg-[#FFFFFF]">
        <Nav />
      </div>
    </div>
  )
}
