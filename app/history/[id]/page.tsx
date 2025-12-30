'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ResultDisplay from '@/components/ResultDisplay';
import { MeetingResult } from '@/types';

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetingId, setMeetingId] = useState<string>('');

  useEffect(() => {
    // Unwrap params Promise in Next.js 15
    params.then(({ id }) => {
      setMeetingId(id);
    });
  }, []);

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`);
      
      if (!response.ok) {
        throw new Error('Meeting not found');
      }

      const data = await response.json();
      setMeeting(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!meeting) return;
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meeting),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meetingId}.pdf`;
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
    router.push('/history');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Meeting Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error || 'This meeting could not be found.'}</p>
          <button
            onClick={() => router.push('/history')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/history')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to History
        </button>

        {/* Meeting Content */}
        <ResultDisplay 
          result={meeting} 
          onDownloadPDF={handleDownloadPDF}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

