'use client';

import { useEffect, useState } from 'react';
import { MeetingResult } from '@/types';
import ResultDisplay from '@/components/ResultDisplay';

export default function ResultsPage() {
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('?? Results page mounted');
    
    // Function to load results from localStorage
    const loadResults = () => {
      console.log('?? Attempting to load results from localStorage...');
      const savedResults = localStorage.getItem('meeting-results');
      console.log('?? localStorage data:', savedResults ? 'Data found' : 'No data');
      
      if (savedResults) {
        try {
          console.log('?? Raw data:', savedResults.substring(0, 100) + '...');
          const meetingResult: MeetingResult = JSON.parse(savedResults);
          console.log('? Parsed meeting result:', meetingResult);
          setResult(meetingResult);
          setLoading(false);
          
          // Clear localStorage after reading
          localStorage.removeItem('meeting-results');
          console.log('??? Cleared localStorage');
          return true;
        } catch (error) {
          console.error('? Error parsing results:', error);
        }
      }
      return false;
    };

    // Try to load immediately
    console.log('?? Trying immediate load...');
    const loaded = loadResults();
    console.log('?? Immediate load result:', loaded ? 'Success' : 'Failed');
    
    if (!loaded) {
      console.log('?? Setting up event listener for meetingResultsReady');
      
      // If not loaded, listen for the custom event from extension
      const handleResultsReady = (event: any) => {
        console.log('?? Meeting results ready event received!', event.detail);
        loadResults();
      };
      
      window.addEventListener('meetingResultsReady', handleResultsReady);
      
      // Set a timeout to stop loading if no data arrives
      const timeout = setTimeout(() => {
        console.log('? Timeout reached, no data received');
        setLoading(false);
      }, 3000); // Increased to 3 seconds
      
      return () => {
        console.log('?? Cleaning up event listener');
        window.removeEventListener('meetingResultsReady', handleResultsReady);
        clearTimeout(timeout);
      };
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-notes-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleReset = () => {
    setResult(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Results Found
          </h1>
          <p className="text-gray-600 mb-6">
            No meeting results were found. Please record a meeting using the Chrome Extension first.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Meeting Results
          </h1>
          <p className="text-gray-600 mt-2">
            Recorded via Chrome Extension
          </p>
        </div>

        <ResultDisplay 
          result={result} 
          onDownloadPDF={handleDownloadPDF}
          onReset={handleReset}
        />

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

