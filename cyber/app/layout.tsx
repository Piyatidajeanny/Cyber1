import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "SUT Detective CTF ",
  description: "Detective CTF บน Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="container">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
