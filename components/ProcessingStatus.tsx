'use client';

import { ProcessingStep } from '@/types';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProcessingStatusProps {
  steps: ProcessingStep[];
}

export default function ProcessingStatus({ steps }: ProcessingStatusProps) {
  const currentStep = steps.find(s => s.status === 'processing');
  const allCompleted = steps.every(s => s.status === 'completed');
  const hasError = steps.some(s => s.status === 'error');
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <Card className="glass border-slate-200/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-slate-900">
            {hasError ? 'Processing Error' : allCompleted ? 'Processing Complete!' : 'Processing...'}
          </CardTitle>
          {!allCompleted && !hasError && (
            <span className="text-sm font-medium text-indigo-600">
              {completedCount}/{totalSteps}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              {currentStep && (
                <div className="absolute inset-0 shimmer"></div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = step.status === 'processing';
            const isCompleted = step.status === 'completed';
            const isError = step.status === 'error';
            const isPending = step.status === 'pending';

            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-12 transition-colors duration-300 ${
                      isCompleted ? 'bg-indigo-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Step Icon */}
                  <div className="relative flex-shrink-0">
                    {isCompleted && (
                      <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                    )}
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-indigo-500 text-white'
                          : isActive
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                          : isError
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                      {isActive && <Loader2 className="h-5 w-5 animate-spin" />}
                      {isError && <XCircle className="h-5 w-5" />}
                      {isPending && <Circle className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isCompleted
                          ? 'text-indigo-700'
                          : isActive
                          ? 'text-indigo-600'
                          : isError
                          ? 'text-red-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                      {isActive && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-indigo-500">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                          In progress...
                        </span>
                      )}
                    </p>

                    {isActive && step.progress !== undefined && (
                      <div className="mt-3">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-300 relative"
                            style={{ width: `${step.progress}%` }}
                          >
                            <div className="absolute inset-0 shimmer"></div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{step.progress}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Step Info */}
        {currentStep && !hasError && (
          <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
            <p className="text-sm font-medium text-indigo-900 mb-1">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Current step: {currentStep.label}
              </span>
            </p>
            <p className="text-xs text-indigo-700">
              This may take a few minutes depending on file size...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

