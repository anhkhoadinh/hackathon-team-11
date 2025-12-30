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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {hasError ? 'Processing Error' : allCompleted ? 'Processing Complete!' : 'Processing...'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                )}
                {step.status === 'processing' && (
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                )}
                {step.status === 'error' && (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                {step.status === 'pending' && (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'processing' ? 'text-blue-700' :
                  step.status === 'error' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                
                {step.status === 'processing' && step.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{step.progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {currentStep && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Current step:</span> {currentStep.label}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This may take a few minutes depending on file size...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

