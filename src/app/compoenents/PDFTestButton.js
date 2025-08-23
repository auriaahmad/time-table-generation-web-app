// Test component for PDF generation
'use client';

import { useState, useEffect } from 'react';
import { sampleTimetableData, sampleUniversityData } from '../utils/sampleTimetableData';
import { FileText } from 'lucide-react';

// Dynamic imports to avoid SSR issues
let generateTimetablePDF = null;

export default function PDFTestButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState('');
  const [pdfGeneratorLoaded, setPdfGeneratorLoaded] = useState(false);

  // Load PDF generator only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../utils/pdfGenerator').then(module => {
        generateTimetablePDF = module.generateTimetablePDF;
        setPdfGeneratorLoaded(true);
      });
    }
  }, []);

  const testPDFGeneration = async (type) => {
    if (!pdfGeneratorLoaded || !generateTimetablePDF) {
      setLastGenerated('PDF generator still loading...');
      return;
    }

    setIsGenerating(true);
    try {
      generateTimetablePDF(type, sampleTimetableData, sampleUniversityData, {});
      setLastGenerated(`${type} PDF generated successfully`);
    } catch (error) {
      console.error('PDF generation error:', error);
      setLastGenerated(`Error generating ${type} PDF: ${error.message}`);
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h4 className="font-semibold mb-3 text-gray-900">PDF Test Controls</h4>
      <div className="space-y-2">
        <button 
          onClick={() => testPDFGeneration('master')}
          disabled={isGenerating}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          <FileText size={14} />
          Test Master PDF
        </button>
        
        <button 
          onClick={() => testPDFGeneration('department')}
          disabled={isGenerating}
          className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          <FileText size={14} />
          Test Department PDF
        </button>
        
        <button 
          onClick={() => testPDFGeneration('faculty')}
          disabled={isGenerating}
          className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          <FileText size={14} />
          Test Faculty PDF
        </button>
        
        <button 
          onClick={() => testPDFGeneration('student')}
          disabled={isGenerating}
          className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          <FileText size={14} />
          Test Student PDF
        </button>
        
        <button 
          onClick={() => testPDFGeneration('room')}
          disabled={isGenerating}
          className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
        >
          <FileText size={14} />
          Test Room PDF
        </button>
      </div>
      
      {lastGenerated && (
        <div className="mt-3 text-xs text-gray-600 border-t pt-2">
          {lastGenerated}
        </div>
      )}
      
      {isGenerating && (
        <div className="mt-2 text-xs text-blue-600">
          Generating PDF...
        </div>
      )}
    </div>
  );
}