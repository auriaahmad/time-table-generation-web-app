// app/page.js
'use client';

import ResourceManager from "./compoenents/ResourceManager";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          University Resource Configuration
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Configure all university resources needed for automated timetable generation. 
          Upload existing configuration or create from scratch.
        </p>
      </div>
      
      <ResourceManager />
    </div>
  );
}