"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "../Logo.svg";
import Nav from "../../components/CivilianNavBar";
import { getCurrentUser, logout } from "../../lib/user";

export default function CivilianPage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Redirect to /auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  // While fetching user info
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  // If still no user (not logged in)
  if (!user) return null;

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
      {/* Header */}
      <div className="titleElement flex flex-row items-center justify-center mb-5 w-full h-[90px] bg-[#ECF1E6] px-2 py-4">
        <div className="orgLogo flex flex-col justify-center ml-4">
          <Image src={Logo} alt="EcoCollect Logo" width={180} height={60} />
          <h4 className="text-[#717182] text-[16px] font-medium mt-1">
            Welcome, {user.name}
          </h4>
        </div>

        <div className="pointCard bg-[#FCFEF7] text-black flex flex-col w-40 h-16 border-[1px] border-gray-300 px-2 py-2 ml-auto mr-2 shadow">
          <h4 className="text-[14px] font-light">Points Balance</h4>
          <h2 className="text-[18px] font-semibold">{user.points || 0}</h2>
        </div>

        <button
          onClick={handleLogout}
          className="logoutButton bg-[#FCFEF7] rounded-[64px] mt-[10px] w-[102px] h-[36px] text-black text-[16px] font-medium flex items-center justify-center mr-4 shadow"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="mainContentArea flex flex-col items-center justify-start w-full h-[676px] bg-[#FFFFFF]">
        <Nav />
      </div>
    </div>
  );
}
