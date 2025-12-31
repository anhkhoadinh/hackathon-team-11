'use client';

import { useState, useMemo } from 'react';
import { 
  Download, Copy, CheckCircle, FileText, ListTodo, Target, Users, Search, X, 
  CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Calendar, 
  Sparkles, User, Award, Zap, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { MeetingResult } from '@/types';
import { formatTimestamp, formatDuration } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';

interface ResultDisplayProps {
  result: MeetingResult;
  onDownloadPDF: () => void;
  onReset: () => void;
}

export default function ResultDisplay({ result, onDownloadPDF, onReset }: ResultDisplayProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedSection, setCopiedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadPDF();
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
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
        <mark key={i} className="bg-[#25C9D0]/20 text-slate-900 px-1.5 py-0.5 rounded-md font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const analysis = result.analysis;
  const attendance = analysis.attendance || { present: [], absent: [] };
  const personalProgress = analysis.personalProgress || [];
  const workload = analysis.workload || [];
  const actionItems = analysis.actionItems || [];
  const keyDecisions = analysis.keyDecisions || [];
  const summary = analysis.summary || { blockersToFollowUp: [], priorityTasks: [], responsibilities: [] };

  // Get priority badge color - using brand colors
  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'bg-slate-100 text-slate-700 border-slate-200';
    const p = priority.toLowerCase();
    // Check for English and Vietnamese terms
    if (p.includes('high') || p.includes('cao') || p.includes('高')) return 'bg-[#25C9D0]/10 text-[#1BA1A8] border-[#25C9D0]/30';
    if (p.includes('medium') || p.includes('trung') || p.includes('中')) return 'bg-[#14B8A6]/10 text-[#0F9488] border-[#14B8A6]/30';
    if (p.includes('low') || p.includes('thấp') || p.includes('低')) return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Get workload badge color - using brand colors
  const getWorkloadColor = (status: string) => {
    if (status === 'overloaded') return 'bg-[#25C9D0]/10 text-[#1BA1A8] border-[#25C9D0]/30';
    if (status === 'normal') return 'bg-[#14B8A6]/10 text-[#0F9488] border-[#14B8A6]/30';
    if (status === 'free') return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getWorkloadIcon = (status: string) => {
    if (status === 'overloaded') return AlertCircle;
    if (status === 'normal') return CheckCircle2;
    if (status === 'free') return Sparkles;
    return TrendingUp;
  };

  const getWorkloadIconBg = (status: string) => {
    if (status === 'overloaded') return 'bg-[#25C9D0]/10';
    if (status === 'normal') return 'bg-[#14B8A6]/10';
    if (status === 'free') return 'bg-[#14B8A6]/10';
    return 'bg-[#25C9D0]/10';
  };

  const getWorkloadIconColor = (status: string) => {
    if (status === 'overloaded') return 'text-[#25C9D0]';
    if (status === 'normal') return 'text-[#14B8A6]';
    if (status === 'free') return 'text-[#14B8A6]';
    return 'text-[#25C9D0]';
  };

  const CopyButton = ({ section, text }: { section: string; text: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, section)}
      className="hover:bg-[#25C9D0]/10 hover:text-[#25C9D0] transition-all duration-200"
    >
      {copiedSection === section ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-[#25C9D0]" />
          <span className="text-[#25C9D0] font-semibold">{t('common.copied')}</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {t('common.copy')}
        </>
      )}
    </Button>
  );

  // Section Header Component - Consistent styling
  const SectionHeader = ({ icon: Icon, title, badge, onCopy, copyText }: {
    icon: any;
    title: string;
    badge?: React.ReactNode;
    onCopy?: () => void;
    copyText?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center shadow-sm">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {title}
            {badge}
          </CardTitle>
        </div>
      </div>
      {onCopy && copyText && (
        <CopyButton section={title.toLowerCase()} text={copyText} />
      )}
    </div>
  );

  return (
    <div className="space-y-6 fade-in-up max-w-7xl mx-auto">
      {/* Header Card - Refined */}
      <Card className="glass border-[#25C9D0]/20 shadow-xl overflow-hidden bg-gradient-to-br from-white to-[#25C9D0]/5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25C9D0] via-[#14B8A6] to-[#25C9D0] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]"></div>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#25C9D0]/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold gradient-text">
                    {t('results.title')}
                  </CardTitle>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#25C9D0]" />
                  <span className="font-medium">{result.metadata.fileName}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#25C9D0]" />
                  <span>{formatDuration(result.transcript.duration)}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#25C9D0]" />
                  <span>${result.metadata.estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                variant="primary"
                className="shadow-lg hover:shadow-xl"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {t('results.generating')}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t('results.downloadPDF')}
                  </>
                )}
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-200 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5"
              >
                {t('results.processAnother')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation - Enhanced */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto glass border-[#25C9D0]/20 p-1.5 gap-1 shadow-lg bg-white/80">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="h-4 w-4" />
            {t('results.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('results.tabs.progress')}
            {personalProgress.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
                {personalProgress.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            {t('results.tabs.tasks')}
            {actionItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
                {actionItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="decisions" className="gap-2">
            <Target className="h-4 w-4" />
            {t('results.tabs.decisions')}
            {keyDecisions.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
                {keyDecisions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <Award className="h-4 w-4" />
            {t('results.tabs.summary')}
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('results.tabs.transcript')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Refined */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Card */}
            <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#25C9D0]/5">
              <CardHeader>
                <SectionHeader
                  icon={Users}
                  title={t('results.sections.attendance.title')}
                  onCopy={() => handleCopy(
                    `${t('results.sections.attendance.present', { count: attendance.present.length })}: ${attendance.present.join(', ')}\n${t('results.sections.attendance.absent', { count: attendance.absent.length })}: ${attendance.absent.map(a => a.name + (a.reason ? ` (${a.reason})` : '')).join(', ')}`,
                    'attendance'
                  )}
                  copyText={`${t('results.sections.attendance.present', { count: attendance.present.length })}: ${attendance.present.join(', ')}\n${t('results.sections.attendance.absent', { count: attendance.absent.length })}: ${attendance.absent.map(a => a.name + (a.reason ? ` (${a.reason})` : '')).join(', ')}`}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Present */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#14B8A6]" />
                    {t('results.sections.attendance.present', { count: attendance.present.length })}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {attendance.present.length > 0 ? (
                      attendance.present.map((person, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm font-medium bg-[#14B8A6]/10 text-[#0F9488] border border-[#14B8A6]/20 hover:bg-[#14B8A6]/15 transition-colors"
                        >
                          <User className="h-3.5 w-3.5" />
                          {person}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic text-sm">{t('results.sections.attendance.noInfo')}</p>
                    )}
                  </div>
                </div>

                {/* Absent */}
                {attendance.absent.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-slate-400" />
                      {t('results.sections.attendance.absent', { count: attendance.absent.length })}
                    </h4>
                    <div className="space-y-2">
                      {attendance.absent.map((person, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-slate-50 rounded-[10px] border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="font-medium text-slate-700 block">{person.name}</span>
                              {person.reason && (
                                <span className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                  <AlertCircle className="h-3 w-3" />
                                  {person.reason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workload Card */}
            <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#14B8A6]/5">
              <CardHeader>
                <SectionHeader
                  icon={TrendingUp}
                  title={t('results.sections.workload.title')}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workload.length > 0 ? (
                    workload.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="group flex items-center justify-between p-4 bg-white rounded-[10px] border border-slate-200 hover:border-[#25C9D0]/30 hover:bg-[#25C9D0]/5 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-[8px] ${getWorkloadIconBg(item.status)} flex items-center justify-center`}>
                            {(() => {
                              const IconComponent = getWorkloadIcon(item.status);
                              return <IconComponent className={`h-4 w-4 ${getWorkloadIconColor(item.status)}`} />;
                            })()}
                          </div>
                          <span className="font-semibold text-slate-900">{item.member}</span>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-[8px] text-xs font-semibold border ${getWorkloadColor(item.status)}`}>
                          {item.status === 'overloaded' && t('results.sections.workload.overloaded')}
                          {item.status === 'normal' && t('results.sections.workload.normal')}
                          {item.status === 'free' && t('results.sections.workload.free')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center py-8 text-sm">{t('results.sections.workload.noInfo')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab - Refined */}
        <TabsContent value="progress" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#25C9D0]/5">
            <CardHeader>
              <SectionHeader
                icon={TrendingUp}
                title={t('results.sections.personalProgress.title')}
                onCopy={() => handleCopy(
                  personalProgress.map(p => 
                    `${p.member}:\n- ${t('results.sections.personalProgress.yesterday')}: ${p.yesterday.join(', ')}\n- ${t('results.sections.personalProgress.today')}: ${p.today.join(', ')}\n- ${t('results.sections.personalProgress.blockers')}: ${p.blockers.length > 0 ? p.blockers.join(', ') : t('results.sections.personalProgress.noInfoItem')}`
                  ).join('\n\n'),
                  'progress'
                )}
                copyText={personalProgress.map(p => 
                  `${p.member}:\n- ${t('results.sections.personalProgress.yesterday')}: ${p.yesterday.join(', ')}\n- ${t('results.sections.personalProgress.today')}: ${p.today.join(', ')}\n- ${t('results.sections.personalProgress.blockers')}: ${p.blockers.length > 0 ? p.blockers.join(', ') : t('results.sections.personalProgress.noInfoItem')}`
                ).join('\n\n')}
              />
            </CardHeader>
            <CardContent>
              {personalProgress.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#25C9D0]/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-[#25C9D0]" />
                  </div>
                  <p className="text-slate-500 italic text-sm">{t('results.sections.personalProgress.noInfo')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {personalProgress.map((progress, idx) => (
                    <div 
                      key={idx} 
                      className="group p-6 bg-white rounded-[12px] border border-slate-200 hover:border-[#25C9D0]/30 hover:shadow-md transition-all duration-200"
                    >
                      {/* Member Header */}
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white font-bold text-base shadow-sm">
                          {progress.member.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">{progress.member}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Yesterday */}
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2.5 flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-md bg-[#14B8A6]/10 flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#14B8A6]" />
                            </div>
                            {t('results.sections.personalProgress.yesterday')}
                          </h4>
                          {progress.yesterday.length > 0 ? (
                            <ul className="space-y-1.5 pl-7">
                              {progress.yesterday.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
                                  <span className="text-[#25C9D0] font-bold mt-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-sm pl-7">{t('results.sections.personalProgress.noInfoItem')}</p>
                          )}
                        </div>

                        {/* Today */}
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2.5 flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-md bg-[#25C9D0]/10 flex items-center justify-center">
                              <Calendar className="h-3.5 w-3.5 text-[#25C9D0]" />
                            </div>
                            {t('results.sections.personalProgress.today')}
                          </h4>
                          {progress.today.length > 0 ? (
                            <ul className="space-y-1.5 pl-7">
                              {progress.today.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
                                  <span className="text-[#25C9D0] font-bold mt-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-sm pl-7">{t('results.sections.personalProgress.noInfoItem')}</p>
                          )}
                        </div>

                        {/* Blockers */}
                        {progress.blockers.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-700 mb-2.5 flex items-center gap-2 text-sm">
                              <div className="w-5 h-5 rounded-md bg-[#25C9D0]/10 flex items-center justify-center">
                                <AlertCircle className="h-3.5 w-3.5 text-[#25C9D0]" />
                              </div>
                              {t('results.sections.personalProgress.blockers')}
                            </h4>
                            <ul className="space-y-1.5 pl-7">
                              {progress.blockers.map((blocker, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
                                  <span className="text-[#25C9D0] font-bold mt-1">•</span>
                                  <span>{blocker}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab - Refined */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#25C9D0]/5">
            <CardHeader>
              <SectionHeader
                icon={ListTodo}
                title={t('results.sections.actionItems.title')}
                onCopy={() => handleCopy(
                  actionItems.map(item => 
                    `${item.task} - ${item.assignee}${item.dueDate ? ` (${item.dueDate})` : ''}${item.priority ? ` [${item.priority}]` : ''}`
                  ).join('\n'),
                  'tasks'
                )}
                copyText={actionItems.map(item => 
                  `${item.task} - ${item.assignee}${item.dueDate ? ` (${item.dueDate})` : ''}${item.priority ? ` [${item.priority}]` : ''}`
                ).join('\n')}
              />
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#25C9D0]/10 flex items-center justify-center">
                    <ListTodo className="h-8 w-8 text-[#25C9D0]" />
                  </div>
                  <p className="text-slate-500 italic text-sm">{t('results.sections.actionItems.noItems')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="group p-5 bg-white rounded-[12px] border border-slate-200 hover:border-[#25C9D0]/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 group-hover:border-[#25C9D0] flex items-center justify-center transition-colors bg-white">
                            <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 group-hover:bg-[#25C9D0] transition-colors"></div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-base mb-3 leading-relaxed">
                            {item.task}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-[#25C9D0]/10 text-[#25C9D0] border border-[#25C9D0]/20">
                              <User className="h-3.5 w-3.5" />
                              {item.assignee || t('results.sections.actionItems.unassigned')}
                            </div>
                            {item.dueDate && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock className="h-3.5 w-3.5" />
                                {item.dueDate}
                              </div>
                            )}
                            {item.priority && (
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-[8px] text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </div>
                            )}
                          </div>

                          {item.technicalNotes && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-[10px] border border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-[#25C9D0]" />
                                {t('results.sections.actionItems.technicalNotes')}
                              </p>
                              <p className="text-sm text-slate-600 leading-relaxed">{item.technicalNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decisions Tab - Refined */}
        <TabsContent value="decisions" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#14B8A6]/5">
            <CardHeader>
              <SectionHeader
                icon={Target}
                title={t('results.sections.decisions.title')}
                onCopy={() => handleCopy(keyDecisions.join('\n'), 'decisions')}
                copyText={keyDecisions.join('\n')}
              />
            </CardHeader>
            <CardContent>
              {keyDecisions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-[#14B8A6]" />
                  </div>
                  <p className="text-slate-500 italic text-sm">{t('results.sections.decisions.noDecisions')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keyDecisions.map((decision, index) => (
                    <div
                      key={index}
                      className="group relative p-5 bg-white rounded-[12px] border-l-4 border-[#14B8A6] shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#14B8A6] to-[#0F9488] rounded-[8px] flex items-center justify-center shadow-sm">
                            <Target className="h-4 w-4 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium leading-relaxed text-sm">
                            {decision}
                          </p>
                        </div>
                        <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#14B8A6]/10 text-[#0F9488] border border-[#14B8A6]/20">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab - Refined */}
        <TabsContent value="summary" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#25C9D0]/5">
            <CardHeader>
              <SectionHeader
                icon={Award}
                title={t('results.sections.summary.title')}
                onCopy={() => handleCopy(
                  `${t('results.sections.summary.blockersToFollowUp')}:\n${summary.blockersToFollowUp.join('\n')}\n\n${t('results.sections.summary.priorityTasks')}:\n${summary.priorityTasks.join('\n')}\n\n${t('results.sections.summary.responsibilities')}:\n${summary.responsibilities.map(r => `${r.person}: ${r.task}${r.deadline ? ` (${r.deadline})` : ''}`).join('\n')}`,
                  'summary'
                )}
                copyText={`${t('results.sections.summary.blockersToFollowUp')}:\n${summary.blockersToFollowUp.join('\n')}\n\n${t('results.sections.summary.priorityTasks')}:\n${summary.priorityTasks.join('\n')}\n\n${t('results.sections.summary.responsibilities')}:\n${summary.responsibilities.map(r => `${r.person}: ${r.task}${r.deadline ? ` (${r.deadline})` : ''}`).join('\n')}`}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Blockers */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2.5 flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-md bg-[#25C9D0]/10 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-[#25C9D0]" />
                    </div>
                    {t('results.sections.summary.blockersToFollowUp')}
                  </h4>
                  {summary.blockersToFollowUp.length > 0 ? (
                    <ul className="space-y-1.5 pl-7">
                      {summary.blockersToFollowUp.map((blocker, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
                          <span className="text-[#25C9D0] font-bold mt-1">•</span>
                          <span>{blocker}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-7">{t('results.sections.summary.noBlockers')}</p>
                  )}
                </div>

                {/* Priority Tasks */}
                <div>
                  <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[8px] bg-[#25C9D0]/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-[#25C9D0]" />
                    </div>
                    {t('results.sections.summary.priorityTasks')}
                  </h4>
                  {summary.priorityTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {summary.priorityTasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-3 bg-[#25C9D0]/5 rounded-[10px] border border-[#25C9D0]/20 hover:border-[#25C9D0]/30 transition-colors">
                          <ArrowRight className="h-4 w-4 text-[#25C9D0] mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 font-medium text-sm">{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-9">{t('results.sections.summary.noPriorityTasks')}</p>
                  )}
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[8px] bg-[#14B8A6]/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-[#14B8A6]" />
                    </div>
                    {t('results.sections.summary.responsibilities')}
                  </h4>
                  {summary.responsibilities.length > 0 ? (
                    <div className="space-y-3">
                      {summary.responsibilities.map((resp, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-white rounded-[12px] border border-slate-200 hover:border-[#14B8A6]/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 mb-2 text-sm">{resp.task}</p>
                              <div className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-[#14B8A6]" />
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#14B8A6]/10 text-[#0F9488] border border-[#14B8A6]/20">
                                  {resp.person}
                                </span>
                              </div>
                            </div>
                            {resp.deadline && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                                <Clock className="h-3.5 w-3.5" />
                                {resp.deadline}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-9">{t('results.sections.summary.noResponsibilities')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Tab - Enhanced Readability */}
        <TabsContent value="transcript" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg bg-gradient-to-br from-white to-[#25C9D0]/5">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center shadow-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{t('results.sections.transcript.title')}</CardTitle>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('results.sections.transcript.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-9 py-2.5 border-2 border-slate-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] w-full sm:w-72 transition-all bg-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <CopyButton section="transcript" text={result.transcript.text} />
                </div>
              </div>
              {searchQuery && (
                <p className="text-sm text-[#25C9D0] font-semibold mt-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t('results.sections.transcript.foundMatches', { count: filteredSegments.length })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSegments.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 italic text-sm">{t('results.sections.transcript.noMatches')}</p>
                  </div>
                ) : (
                  filteredSegments.map((segment, idx) => (
                    <div 
                      key={segment.id} 
                      className={`flex items-start gap-4 p-3 rounded-[8px] transition-colors ${
                        idx % 2 === 0 
                          ? 'bg-white hover:bg-slate-50' 
                          : 'bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex-shrink-0 text-xs font-mono font-semibold text-[#25C9D0] bg-[#25C9D0]/10 px-2.5 py-1.5 rounded-[6px] border border-[#25C9D0]/20">
                        {formatTimestamp(segment.start)}
                      </span>
                      <p className="text-slate-700 pt-0.5 leading-relaxed text-sm font-normal flex-1">
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
