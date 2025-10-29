"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../Logo.svg";
import CorporativeNavBar from "../../components/CorporativeNavBar";
import { getCurrentUser, logout } from "../../lib/user";

export default function CorporativePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch the current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.replace("/auth"); // redirect to login if not authenticated
      }
    };
    fetchUser();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout(); // calls API logout and redirects
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-[100dvw] h-[100dvh] flex flex-col items-start text-white text-poppins">
      {/* Header */}
      <div className="titleElement flex flex-row items-center justify-between mb-5 w-full h-[90px] bg-[#ECF1E6] px-16 py-4">
        <div className="orgLogo flex items-center justify-center ml-4">
          <Image
            src={Logo}
            alt="EcoCollect Logo"
            width={180}
            height={60}
            className="object-contain"
          />
          {user && (
            <h4 className="text-[#717182] text-[16px] font-medium ml-4">
              Welcome, {user.name}
            </h4>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="logoutButton bg-[#FCFEF7] rounded-[64px] w-[102px] h-[36px] text-black text-[16px] font-light flex items-center justify-center shadow-[rgba(0,0,0,0.12)0px 1px 3px, rgba(0,0,0,0.24)0px 1px 2px]"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="mainContentArea flex flex-col items-center justify-start w-full h-[676px] bg-[#FFFFFF]">
        <CorporativeNavBar />
      </div>
    </div>
  );
}
