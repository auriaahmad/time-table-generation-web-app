// app/page.js
'use client';

import ResourceManager from "./compoenents/ResourceManager";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <img 
            src="/logo.png" 
            alt="University Logo" 
            className="h-40 w-auto object-contain"
          />
        </div>
      </div>
      
      <ResourceManager />
    </div>
  );
}