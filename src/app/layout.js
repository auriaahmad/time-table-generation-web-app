// app/layout.js
import './globals.css';

export const metadata = {
  title: 'University Timetable Resource Manager',
  description: 'Comprehensive resource management for automated university timetable generation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-gray-900">
                      University Timetable Manager
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Resource Configuration
                  </span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          
          <footer className="bg-white border-t mt-auto">
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