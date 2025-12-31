'use client';

import { useEffect, useState } from 'react';
import { MeetingResult } from '@/types';
import ResultDisplay from '@/components/ResultDisplay';
import { useTranslation } from '@/contexts/TranslationContext';

export default function ResultsPage() {
  const { t } = useTranslation();
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25C9D0] mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">{t('resultsPage.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md glass border-[#25C9D0]/20 rounded-[16px] p-8 shadow-xl">
            <h1 className="text-2xl font-bold gradient-text mb-4">
              {t('resultsPage.noResults')}
            </h1>
            <p className="text-slate-600 mb-6">
              {t('resultsPage.noResultsMessage')}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white rounded-lg hover:shadow-lg transition-all shadow-lg shadow-[#25C9D0]/30"
            >
              {t('resultsPage.goToHome')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="space-y-6 fade-in-up">
          {/* Header Section */}
          <div className="glass border-[#25C9D0]/20 rounded-[16px] p-6 shadow-xl">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {t('resultsPage.title')}
            </h1>
            <p className="text-slate-600">
              {t('resultsPage.subtitle')}
            </p>
          </div>

          {/* Result Display */}
          <ResultDisplay 
            result={result} 
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
          />

          {/* Back Button */}
          <div className="text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5 transition-all font-medium"
            >
              {t('resultsPage.backToHome')}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

