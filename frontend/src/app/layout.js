// src/app/layout.js
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "EcoCollect",
  description: "AI-powered recycling and rewards platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* You can add a Navbar here later */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
