'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Users, FileText, Zap } from 'lucide-react';
import ResultDisplay from '@/components/ResultDisplay';
import { MeetingResult } from '@/types';
import { formatDuration } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <p className="mt-4 text-slate-600 font-medium">{t('meetingDetail.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
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
              {t('meetingDetail.notFound')}
            </h1>
            <p className="text-slate-600 mb-6">{error || t('meetingDetail.notFoundMessage')}</p>
            <button
              onClick={() => router.push('/history')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white rounded-lg hover:shadow-lg transition-all shadow-lg shadow-[#25C9D0]/30"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('meetingDetail.backToHistory')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get meeting metadata
  const meetingDate = (meeting as any).meetingDate || meeting.metadata.processedAt;
  const source = (meeting as any).source || 'upload';
  const title = (meeting as any).title || meeting.metadata.fileName;
  const participants = meeting.analysis.participants || [];

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
          {/* Header Section with Back Button and Metadata */}
          <div className="glass border-[#25C9D0]/20 rounded-[16px] p-6 shadow-xl">
            <div className="flex flex-col gap-4">
              {/* Back Button */}
              <button
                onClick={() => router.push('/history')}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-[#25C9D0] transition-colors self-start group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{t('meetingDetail.backToHistory')}</span>
              </button>

              {/* Meeting Title */}
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-4">
                  {title}
                </h1>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#25C9D0]" />
                    <span className="font-medium">{formatDate(meetingDate)}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#25C9D0]" />
                    <span>{formatDuration(meeting.transcript.duration)}</span>
                  </div>
                  {participants.length > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#25C9D0]" />
                        <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#25C9D0]" />
                    <span>${meeting.metadata.estimatedCost.toFixed(2)}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                    source === 'extension'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-[#25C9D0]/10 text-[#25C9D0] border-[#25C9D0]/20'
                  }`}>
                    {source === 'extension' ? t('meetingDetail.source.extension') : t('meetingDetail.source.upload')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Content - Using ResultDisplay exactly like Home page */}
          <ResultDisplay 
            result={meeting} 
            onDownloadPDF={handleDownloadPDF}
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
}

