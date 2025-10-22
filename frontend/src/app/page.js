"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button
        onClick={() => router.push("/auth")}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
        }}
      >
        Go to Auth Page
      </button>
    </div>
  );
}
