'use client';

export default function Information() {
  return (
    <div className="space-y-8">
      <div className="text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl opacity-60"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -top-5 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-75"></div>
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-36 h-36 bg-pink-200 rounded-full opacity-20 animate-pulse delay-150"></div>
        
        {/* Content */}
        <div className="relative z-10 py-16 px-8">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              🎓 Educational Technology
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              University Timetable
            </span>
            <br />
            <span className="text-gray-800">
              Generation System
            </span>
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
              An intelligent automated system for generating 
              <span className="font-semibold text-gray-800"> optimized university timetables</span>
            </p>
            <p className="text-lg text-gray-500">
              Streamline your academic scheduling with AI-powered resource management and conflict resolution
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-8 flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 bg-white bg-opacity-70 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-70 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Automated</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-70 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Optimized</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-purple-100 p-4 rounded-full">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Assistance</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6">
            Our intelligent AI agent can help you make necessary changes to the generated timetable, 
            optimize resource allocation, resolve conflicts, and provide suggestions for improving 
            your scheduling workflow. Simply ask the AI to assist with any modifications or 
            improvements you need.
          </p>
          <div className="bg-white bg-opacity-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600 font-medium">
              💡 Visit the AI Agent section to get personalized assistance with your timetable management
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Configure Resources</h3>
            <p className="text-sm text-gray-600">Set up your departments, teachers, students, subjects, rooms, and time slots</p>
          </div>
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate Timetable</h3>
            <p className="text-sm text-gray-600">Let our algorithms create an optimized timetable based on your resources</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Optimization</h3>
            <p className="text-sm text-gray-600">Use our AI agent to fine-tune and make necessary adjustments</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-3">Resource Management</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Configure and manage all university resources including:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Departments and Programs
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Teachers and Faculty
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Students and Classes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Subjects and Courses
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Rooms and Time Slots
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-3">Timetable Generation</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Generate optimized university timetables automatically using advanced algorithms:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Conflict-free scheduling
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Resource optimization
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Constraint satisfaction
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Multiple format exports
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}