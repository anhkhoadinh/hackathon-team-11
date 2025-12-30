'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultDisplay from '@/components/ResultDisplay';
import { MeetingResult, ProcessingStep } from '@/types';
import { estimateCost } from '@/lib/utils';

type AppState = 'upload' | 'processing' | 'complete';

const initialSteps: ProcessingStep[] = [
  { id: 'upload', label: 'Uploading file', status: 'pending' },
  { id: 'transcribe', label: 'Transcribing audio with Whisper AI', status: 'pending' },
  { id: 'analyze', label: 'Analyzing content with GPT-4', status: 'pending' },
  { id: 'generate', label: 'Generating PDF report', status: 'pending' },
  { id: 'complete', label: 'Done!', status: 'pending' },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [steps, setSteps] = useState<ProcessingStep[]>(initialSteps);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [error, setError] = useState<string>('');

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
        body: JSON.stringify({ transcript: transcriptData.text }),
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meeting AI Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your meeting recordings into actionable insights with AI-powered transcription and analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {appState === 'upload' && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {appState === 'processing' && (
            <>
              <ProcessingStatus steps={steps} />
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>
            Powered by OpenAI Whisper & GPT-4 ? Cost: ~$0.40 per 60min meeting
          </p>
          <p className="mt-2">
            Built for efficient meeting documentation and team collaboration
          </p>
        </footer>
      </div>
    </main>
  );
}
