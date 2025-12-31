'use client';

import { ProcessingStep } from '@/types';
import { CheckCircle2, Circle, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  onRetry?: () => void;
}

export default function ProcessingStatus({ steps, onRetry }: ProcessingStatusProps) {
  const { t } = useTranslation();
  const currentStep = steps.find(s => s.status === 'processing');
  const currentStepIndex = currentStep ? steps.indexOf(currentStep) : -1;
  const allCompleted = steps.every(s => s.status === 'completed');
  const hasError = steps.some(s => s.status === 'error');
  const errorStep = steps.find(s => s.status === 'error');
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <Card className="glass border-[#25C9D0]/20 shadow-2xl scale-in">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-slate-600 mb-2">
              {hasError ? (
                <span className="flex items-center gap-3 text-red-600">
                  <XCircle className="h-8 w-8" />
                  {t('processing.failed')}
                </span>
              ) : allCompleted ? (
                <span className="flex items-center gap-3 text-[#25C9D0]">
                  <CheckCircle2 className="h-8 w-8" />
                  {t('processing.complete')}
                </span>
              ) : (
                <span className="gradient-text">{t('processing.title')}</span>
              )}
            </CardTitle>
            <p className="text-slate-600">
              {hasError
                ? t('processing.errorDescription')
                : allCompleted
                ? t('processing.completeDescription')
                : t('processing.description')}
            </p>
          </div>
          {!allCompleted && !hasError && (
            <div className="flex flex-col items-end">
              <span className="text-4xl font-bold gradient-text">
                {Math.round(progressPercentage)}%
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {t('processing.progress', { current: completedCount, total: totalSteps })}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        {/* Horizontal Timeline */}
        <div className="relative mb-12">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              {currentStep && (
                <div className="absolute inset-0 progress-flow"></div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = step.status === 'processing';
              const isCompleted = step.status === 'completed';
              const isError = step.status === 'error';
              const isPending = step.status === 'pending';

              return (
                <div key={step.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                  {/* Step Icon */}
                  <div className="relative z-10 mb-4">
                    {isCompleted && (
                      <div className="absolute inset-0 bg-[#25C9D0] rounded-full animate-ping opacity-30"></div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-[#25C9D0] rounded-full blur-xl opacity-50 primary-glow"></div>
                    )}
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] border-white shadow-xl shadow-[#25C9D0]/30'
                          : isActive
                          ? 'bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] border-white shadow-2xl shadow-[#25C9D0]/50 scale-110'
                          : isError
                          ? 'bg-red-500 border-white shadow-lg shadow-red-500/30'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={3} />}
                      {isActive && <Loader2 className="h-6 w-6 text-white animate-spin" strokeWidth={3} />}
                      {isError && <XCircle className="h-6 w-6 text-white" strokeWidth={3} />}
                      {isPending && <Circle className="h-5 w-5 text-slate-400" strokeWidth={2} />}
                    </div>
                  </div>

                  {/* Step Label */}
                  <div className="text-center max-w-[140px]">
                    <p
                      className={`text-sm font-bold transition-colors mb-1 ${
                        isCompleted
                          ? 'text-[#25C9D0]'
                          : isActive
                          ? 'text-[#25C9D0]'
                          : isError
                          ? 'text-red-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                        <span className="w-1.5 h-1.5 bg-[#25C9D0] rounded-full animate-pulse"></span>
                        <span>{t('processing.inProgress')}</span>
                      </div>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-[#25C9D0] font-medium">{t('processing.done')}</span>
                    )}
                  </div>

                  {/* Progress bar for active step */}
                  {isActive && step.progress !== undefined && (
                    <div className="mt-3 w-32">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${step.progress}%` }}
                        >
                          <div className="absolute inset-0 progress-flow"></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-center font-medium">{step.progress}%</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Info */}
        {currentStep && !hasError && (
          <div className="p-6 bg-gradient-to-br from-[#25C9D0]/5 to-[#14B8A6]/5 rounded-[16px] border-2 border-[#25C9D0]/20 fade-in-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <Loader2 className="h-6 w-6 text-[#25C9D0] animate-spin" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-600 mb-2">
                  {t('processing.currently', { step: currentStep.label })}
                </p>
                <p className="text-sm text-slate-600">
                  {currentStep.id === 'analyze' 
                    ? t('processing.analyzeMessage')
                    : t('processing.waitMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && errorStep && (
          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-[16px] border-2 border-red-300 fade-in-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="h-6 w-6 text-red-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-red-900 mb-2">
                  {t('processing.errorAt', { step: errorStep.label })}
                </p>
                <p className="text-sm text-red-700 mb-4">
                  {t('processing.errorMessage')}
                </p>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {t('common.tryAgain')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {allCompleted && (
          <div className="p-6 bg-gradient-to-br from-[#25C9D0]/5 to-[#14B8A6]/5 rounded-[16px] border-2 border-[#25C9D0]/30 fade-in-up">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-[#25C9D0]" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-600 mb-1">
                  {t('processing.successTitle')}
                </p>
                <p className="text-sm text-slate-600">
                  {t('processing.successMessage')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
