'use client';

import { useState } from 'react';
import { Mic, Sparkles, History } from 'lucide-react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultDisplay from '@/components/ResultDisplay';
import { MeetingResult, ProcessingStep } from '@/types';
import { estimateCost } from '@/lib/utils';

type AppState = 'upload' | 'processing' | 'complete';
type Language = 'vi' | 'en' | 'ja';

const initialSteps: ProcessingStep[] = [
  { id: 'upload', label: 'Uploading file', status: 'pending' },
  { id: 'transcribe', label: 'Transcribing audio with Whisper AI', status: 'pending' },
  { id: 'analyze', label: 'Analyzing content with GPT-4', status: 'pending' },
  { id: 'generate', label: 'Generating PDF report', status: 'pending' },
  { id: 'complete', label: 'Done!', status: 'pending' },
];

const languages = [
  { value: 'vi' as Language, label: '🇻🇳 Vietnamese', flag: '🇻🇳' },
  { value: 'en' as Language, label: '🇺🇸 English', flag: '🇺🇸' },
  { value: 'ja' as Language, label: '🇯🇵 Japanese', flag: '🇯🇵' },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [steps, setSteps] = useState<ProcessingStep[]>(initialSteps);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');

  const updateStep = (stepId: string, status: ProcessingStep['status'], progress?: number) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status, progress } : step
      )
    );
  };

  const handleFileSelect = async (file: File) => {
    setAppState('processing');
    setError('');
    setSteps(initialSteps);

    try {
      // Step 1: Upload & Transcribe
      updateStep('upload', 'processing');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      updateStep('upload', 'completed');
      updateStep('transcribe', 'processing');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const transcriptData = await transcribeResponse.json();
      console.log('Transcription complete:', transcriptData);

      updateStep('transcribe', 'completed');
      updateStep('analyze', 'processing');

      // Step 2: Analyze with GPT-4
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcriptData.text,
          language: language,
        }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisData = await analyzeResponse.json();
      console.log('Analysis complete:', analysisData);

      updateStep('analyze', 'completed');
      updateStep('generate', 'processing');

      // Prepare result
      const meetingResult: MeetingResult = {
        transcript: {
          text: transcriptData.text,
          segments: transcriptData.segments,
          duration: transcriptData.duration,
        },
        analysis: analysisData,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
          estimatedCost: estimateCost(Math.ceil(transcriptData.duration / 60)),
        },
      };

      setResult(meetingResult);

      // Save to database
      try {
        const saveResponse = await fetch('/api/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `${file.name.replace(/\.(mp3|mp4|wav|webm|ogg|m4a)$/i, '')}`,
            meetingDate: new Date().toISOString(),
            duration: transcriptData.duration,
            transcript: meetingResult.transcript,
            analysis: analysisData,
            source: 'upload',
            fileName: file.name,
            fileSize: file.size,
            estimatedCost: meetingResult.metadata.estimatedCost,
          }),
        });

        if (saveResponse.ok) {
          console.log('Meeting saved to database successfully');
        } else {
          console.warn('Failed to save meeting to database (non-critical)');
        }
      } catch (saveError) {
        console.warn('Database save error (non-critical):', saveError);
      }

      updateStep('generate', 'completed');
      updateStep('complete', 'completed');
      
      setAppState('complete');
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'An error occurred during processing');
      
      // Mark current step as error
      const currentStep = steps.find(s => s.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, 'error');
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-transcript-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setSteps(initialSteps);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">MeetingMind AI</h1>
                <p className="text-xs text-slate-600 hidden sm:block">Turn your meetings into actionable insights instantly.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {appState === 'upload' && (
                <>
                  <label htmlFor="language-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    Processing Language:
                  </label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-full sm:w-auto"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <Link
                href="/history"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-medium transition-all"
              >
                <History className="w-4 h-4" />
                History
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Main Content */}
        <div className="space-y-6">
          {appState === 'upload' && (
            <FileUpload onFileSelect={handleFileSelect} language={language} />
          )}

          {appState === 'processing' && (
            <>
              <ProcessingStatus steps={steps} />
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg glass">
                  <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm text-red-700 underline hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          )}

          {appState === 'complete' && result && (
            <ResultDisplay 
              result={result} 
              onDownloadPDF={handleDownloadPDF}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-500">
          <p>
            Powered by OpenAI Whisper & GPT-4 • Cost: ~$0.40 per 60min meeting
          </p>
          <p className="mt-2">
            Built for efficient meeting documentation and team collaboration
          </p>
        </footer>
      </main>
    </div>
  );
}
