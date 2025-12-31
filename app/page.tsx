'use client';

import { useState } from 'react';
import { Sparkles, XCircle, ArrowLeft, Zap, Globe, FileText } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultDisplay from '@/components/ResultDisplay';
import Header from '@/components/Header';
import { MeetingResult, ProcessingStep } from '@/types';
import { estimateCost } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';

type AppState = 'upload' | 'processing' | 'complete';
type Language = 'vi' | 'en' | 'ja';

const initialSteps: ProcessingStep[] = [
  { id: 'upload', label: 'Upload', status: 'pending' },
  { id: 'transcribe', label: 'Transcribe', status: 'pending' },
  { id: 'analyze', label: 'Analyze', status: 'pending' },
  { id: 'complete', label: 'Complete', status: 'pending' },
];

const languages = [
  { value: 'vi' as Language, label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { value: 'ja' as Language, label: '日本語', flag: '🇯🇵' },
];

export default function Home() {
  const { t } = useTranslation();
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
      updateStep('complete', 'processing');

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
      // Only set result and mark complete when all steps are done
      updateStep('complete', 'completed');
      setResult(meetingResult);
      
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
      a.download = `meeting-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Modern Header */}
      <Header showHistoryLink={true} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="space-y-8">
          {/* Upload State */}
          {appState === 'upload' && (
            <div className="fade-in-up">
              <FileUpload 
                onFileSelect={handleFileSelect} 
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
          )}

          {/* Processing State */}
          {appState === 'processing' && (
            <div className="space-y-6 fade-in-up">
              <ProcessingStatus steps={steps} onRetry={handleReset} />
              {error && (
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-[16px] glass fade-in-up">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-2 text-lg">{t('errors.processingError')}</h3>
                      <p className="text-sm text-red-700 mb-4">{error}</p>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-300 rounded-[10px] text-sm font-semibold text-red-700 hover:bg-red-50 transition-all"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.tryAgain')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete State - Show timeline and results */}
          {appState === 'complete' && result && (
            <div className="space-y-6 fade-in-up">
              {/* Keep timeline visible after completion */}
              <ProcessingStatus steps={steps} onRetry={handleReset} />
              {/* Show AI results only when complete */}
              <ResultDisplay 
                result={result} 
                onDownloadPDF={handleDownloadPDF}
                onReset={handleReset}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t-2 border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#25C9D0]/10 to-[#14B8A6]/10 border border-[#25C9D0]/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-[#25C9D0]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t('footer.features.aiPowered.title')}</h4>
                <p className="text-sm text-slate-600">
                  {t('footer.features.aiPowered.description')}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#25C9D0]/10 to-[#14B8A6]/10 border border-[#25C9D0]/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-[#25C9D0]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t('footer.features.multiLanguage.title')}</h4>
                <p className="text-sm text-slate-600">
                  {t('footer.features.multiLanguage.description')}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#25C9D0]/10 to-[#14B8A6]/10 border border-[#25C9D0]/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#25C9D0]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{t('footer.features.pdfReports.title')}</h4>
                <p className="text-sm text-slate-600">
                  {t('footer.features.pdfReports.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="text-center pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-semibold text-[#25C9D0]">{t('footer.costEffective').split(':')[0]}:</span> {t('footer.costEffective').split(':')[1]}
            </p>
            <p className="text-xs text-slate-500">
              {t('footer.tagline')}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
