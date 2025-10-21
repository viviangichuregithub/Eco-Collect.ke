import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Eco-Collect, Kenya",
  description: "Connecting citizens and corporations for a circular economy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
        style={{
          margin: 0,
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
