'use client';

import { useState, useMemo } from 'react';
import { Download, Copy, CheckCircle, FileText, ListTodo, Target, Users, Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  // Filter transcript segments based on search query
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return result.transcript.segments;
    const query = searchQuery.toLowerCase();
    return result.transcript.segments.filter(segment =>
      segment.text.toLowerCase().includes(query)
    );
  }, [result.transcript.segments, searchQuery]);

  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-slate-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card className="glass border-slate-200/50 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Meeting Analysis Complete</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {result.metadata.fileName} • {formatDuration(result.transcript.duration)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onDownloadPDF} 
                size="default"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={onReset} variant="outline" className="border-slate-300">
                Process Another
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto glass border-slate-200/50 p-1.5 gap-1">
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
        <TabsContent value="summary" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">Meeting Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.analysis.summary.join('\n'), 'summary')}
                  className="hover:bg-slate-100"
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
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">Participants:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.participants.map((participant, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-700 border border-indigo-200"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <ul className="space-y-4">
                {result.analysis.summary.map((point, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 pt-1 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">Action Items</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    result.analysis.actionItems.map(item => `${item.task} - ${item.assignee}`).join('\n'),
                    'tasks'
                  )}
                  className="hover:bg-slate-100"
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
                <p className="text-slate-500 italic text-center py-8">No action items detected in this meeting.</p>
              ) : (
                <div className="space-y-3">
                  {result.analysis.actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded border-2 border-slate-300 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-3">{item.task}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              item.assignee && item.assignee !== 'Unassigned'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Users className="h-3 w-3 mr-1.5" />
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
        <TabsContent value="decisions" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">Key Decisions</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.analysis.keyDecisions.join('\n'), 'decisions')}
                  className="hover:bg-slate-100"
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
                <p className="text-slate-500 italic text-center py-8">No key decisions detected in this meeting.</p>
              ) : (
                <div className="space-y-4">
                  {result.analysis.keyDecisions.map((decision, index) => (
                    <div
                      key={index}
                      className="relative p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-l-4 border-amber-400 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-amber-600" />
                          </div>
                        </div>
                        <p className="text-slate-800 leading-relaxed flex-1">{decision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Transcript Tab */}
        <TabsContent value="transcript" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl font-bold text-slate-900">Full Transcript</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.transcript.text, 'transcript')}
                    className="hover:bg-slate-100"
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
              </div>
              {searchQuery && (
                <p className="text-sm text-slate-600 mt-2">
                  Found {filteredSegments.length} matching segment{filteredSegments.length !== 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredSegments.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-8">No matching segments found.</p>
                ) : (
                  filteredSegments.map((segment) => (
                    <div 
                      key={segment.id} 
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex-shrink-0 text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded font-medium">
                        {formatTimestamp(segment.start)}
                      </span>
                      <p className="text-slate-700 pt-0.5 leading-relaxed">
                        {highlightText(segment.text, searchQuery)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
