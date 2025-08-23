// app/layout.js
import './globals.css';
import Link from 'next/link';
import Navigation from './compoenents/Navigation';

export const metadata = {
  title: 'University Timetable Resource Manager',
  description: 'Comprehensive resource management for automated university timetable generation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <Link href="/information" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                    <img
                      src="/logo.png"
                      alt="University Logo"
                      className="h-10 w-auto object-contain"
                      title="Click to learn more about this timetable generation system"
                    />
                  </Link>
                </div>
                <Navigation />
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="bg-white mt-auto relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                © 2025 University Timetable Resource Manager. Built for automated scheduling.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}