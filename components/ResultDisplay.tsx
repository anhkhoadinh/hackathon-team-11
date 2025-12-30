'use client';

import { useState } from 'react';
import { Download, Copy, CheckCircle, FileText, ListTodo, Target, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { MeetingResult } from '@/types';
import { formatTimestamp, formatDuration } from '@/lib/utils';

interface ResultDisplayProps {
  result: MeetingResult;
  onDownloadPDF: () => void;
  onReset: () => void;
}

export default function ResultDisplay({ result, onDownloadPDF, onReset }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [copiedSection, setCopiedSection] = useState<string>('');

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Meeting Analysis Complete</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {result.metadata.fileName} ? {formatDuration(result.transcript.duration)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onDownloadPDF} size="default">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={onReset} variant="outline">
                Process Another
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            Action Items ({result.analysis.actionItems.length})
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <Target className="h-4 w-4 mr-2" />
            Key Decisions
          </TabsTrigger>
          <TabsTrigger value="transcript">
            <Users className="h-4 w-4 mr-2" />
            Full Transcript
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Meeting Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.analysis.summary.join('\n'), 'summary')}
                >
                  {copiedSection === 'summary' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {result.analysis.participants.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Participants:</p>
                  <p className="text-sm text-gray-600">{result.analysis.participants.join(', ')}</p>
                </div>
              )}
              
              <ul className="space-y-3">
                {result.analysis.summary.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Action Items</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    result.analysis.actionItems.map(item => `${item.task} - ${item.assignee}`).join('\n'),
                    'tasks'
                  )}
                >
                  {copiedSection === 'tasks' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {result.analysis.actionItems.length === 0 ? (
                <p className="text-gray-500 italic">No action items detected in this meeting.</p>
              ) : (
                <div className="space-y-3">
                  {result.analysis.actionItems.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.task}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {item.assignee || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Decisions Tab */}
        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Key Decisions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.analysis.keyDecisions.join('\n'), 'decisions')}
                >
                  {copiedSection === 'decisions' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {result.analysis.keyDecisions.length === 0 ? (
                <p className="text-gray-500 italic">No key decisions detected in this meeting.</p>
              ) : (
                <ul className="space-y-3">
                  {result.analysis.keyDecisions.map((decision, index) => (
                    <li key={index} className="flex items-start p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <Target className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{decision}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Transcript Tab */}
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Full Transcript</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.transcript.text, 'transcript')}
                >
                  {copiedSection === 'transcript' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {result.transcript.segments.map((segment) => (
                  <div key={segment.id} className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formatTimestamp(segment.start)}
                    </span>
                    <p className="text-gray-700 pt-0.5">{segment.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

