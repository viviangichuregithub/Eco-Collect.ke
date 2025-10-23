// src/app/layout.js
import "./globals.css";
<<<<<<< HEAD
=======
import { AuthProvider } from "../context/AuthContext";
>>>>>>> f6300795dd69e71e1abaa67abacfe9f0ca206ea6

export const metadata = {
  title: "EcoCollect",
  description: "AI-powered recycling and rewards platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
>>>>>>> f6300795dd69e71e1abaa67abacfe9f0ca206ea6
    </html>
  );
}
