"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../Logo.svg";
import Nav from "../../components/CivilianNavBar";
import { getCurrentUser, logout } from "../../lib/user";

export default function CivilianPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.replace("/auth");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col text-white text-poppins">
      <div className="titleElement flex flex-row items-center justify-center mb-5 w-full h-[90px] bg-[#ECF1E6] px-2 py-4">
        <div className="orgLogo flex flex-col justify-center ml-4">
          <Image src={Logo} alt="EcoCollect Logo" width={180} height={60} />
          {user && <h4 className="text-[#717182] text-[16px] font-medium mt-1">Welcome, {user.name}</h4>}
        </div>

        <div className="pointCard bg-[#FCFEF7] text-black flex flex-col w-40 h-16 border-[1px] border-gray-300 px-2 py-2 ml-auto mr-2 shadow">
          <h4 className="text-[14px] font-light">Points Balance</h4>
          <h2 className="text-[18px] font-semibold">{user ? user.points || 0 : 0}</h2>
        </div>

        <button
          onClick={handleLogout}
          className="logoutButton bg-[#FCFEF7] rounded-[64px] mt-[10px] w-[102px] h-[36px] text-black text-[16px] font-medium flex items-center justify-center mr-4 shadow"
        >
          Logout
        </button>
      </div>

      <div className="mainContentArea flex flex-col items-center justify-start w-full h-[676px] bg-[#FFFFFF]">
        <Nav />
      </div>
    </div>
  );
}
