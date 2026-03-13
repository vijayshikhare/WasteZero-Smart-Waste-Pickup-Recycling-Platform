// src/layouts/RootLayout.jsx
import Navbar from '../components/Navbar/Navbar';

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Global Navbar on ALL pages */}
      <Navbar />

      {/* Main content with top padding to avoid overlap */}
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
}