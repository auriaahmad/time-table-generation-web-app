// app/page.js
'use client';

import ResourceManager from "./compoenents/ResourceManager";

export default function Home() {
  return (
    <div className="">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <img 
            src="/logo.png" 
            alt="University Logo" 
            className="h-48 w-auto object-contain"
          />
        </div>
      </div>
      
      <ResourceManager />
    </div>
  );
}