// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "EcoCollect",
  description: "AI-powered recycling and rewards platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
