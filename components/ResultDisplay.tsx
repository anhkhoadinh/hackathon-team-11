'use client';

import { useState, useMemo } from 'react';
import { 
  Download, Copy, CheckCircle, FileText, ListTodo, Target, Users, Search, X, 
  CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Calendar, 
  Sparkles, User, Award, Zap, ArrowRight, CheckCircle2 as CheckCircleIcon,
  Star, Flag, Rocket, Lightbulb, Shield, CheckSquare
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
        <mark key={i} className="bg-[#25C9D0]/20 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
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
          <CardTitle className="text-xl font-bold text-slate-600 flex items-center gap-2">
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
    <div className="fade-in-up max-w-7xl mx-auto">
      {/* Unified Result Panel - Single Container */}
      <Card className="glass border-[#25C9D0]/20 shadow-xl overflow-hidden bg-gradient-to-br from-white to-[#25C9D0]/5">
        {/* Decorative top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25C9D0] via-[#14B8A6] to-[#25C9D0] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]"></div>
        
        {/* Header Section */}
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left: Title and Metadata */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#25C9D0]/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-[#25C9D0]" />
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
            
            {/* Right: Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                variant="outline"
                className="border-2 border-slate-200 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#25C9D0] border-t-transparent mr-2"></div>
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

        {/* Divider */}
        <div className="border-t border-slate-200/60 mx-6"></div>

        {/* Tabs Navigation - Inside the unified container, fixed like table header */}
        <div className="px-6 pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="sticky top-0 z-10 bg-gradient-to-br from-white to-[#25C9D0]/5 pb-4 -mx-6 px-6">
              <TabsList className="w-full justify-between glass border-[#25C9D0]/20 p-1.5 gap-1 shadow-lg bg-white/80">
              <TabsTrigger value="overview" className="gap-2 flex-1 min-w-0">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.overview')}</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2 flex-1 min-w-0">
                <TrendingUp className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.progress')}</span>
                {personalProgress.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold flex-shrink-0 ${
                    activeTab === 'progress' 
                      ? 'bg-white/30 text-white border border-white/50' 
                      : 'bg-[#25C9D0]/20 text-[#25C9D0]'
                  }`}>
                    {personalProgress.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2 flex-1 min-w-0">
                <ListTodo className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.tasks')}</span>
                {actionItems.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold flex-shrink-0 ${
                    activeTab === 'tasks' 
                      ? 'bg-white/30 text-white border border-white/50' 
                      : 'bg-[#25C9D0]/20 text-[#25C9D0]'
                  }`}>
                    {actionItems.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="decisions" className="gap-2 flex-1 min-w-0">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.decisions')}</span>
                {keyDecisions.length > 0 && (
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold flex-shrink-0 ${
                    activeTab === 'decisions' 
                      ? 'bg-white/30 text-white border border-white/50' 
                      : 'bg-[#25C9D0]/20 text-[#25C9D0]'
                  }`}>
                    {keyDecisions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2 flex-1 min-w-0">
                <Award className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.summary')}</span>
              </TabsTrigger>
              <TabsTrigger value="transcript" className="gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('results.tabs.transcript')}</span>
              </TabsTrigger>
              </TabsList>
              
              {/* Subtle divider below tabs */}
              <div className="border-t border-slate-200/40 mt-4"></div>
            </div>

            {/* Tab Content Area */}
            <div className="pb-6">
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
                  <h4 className="font-semibold text-slate-600 mb-3 flex items-center gap-2">
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
                    <h4 className="font-semibold text-slate-600 mb-3 flex items-center gap-2">
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
                          <span className="font-semibold text-slate-600">{item.member}</span>
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
                        <h3 className="font-bold text-lg text-slate-600">{progress.member}</h3>
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
                                  <span className="text-[#25C9D0] font-bold">•</span>
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
                                  <span className="text-[#25C9D0] font-bold">•</span>
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
                                  <span className="text-[#25C9D0] font-bold">•</span>
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

          {/* Tasks Tab - Clean & Simple Design */}
          <TabsContent value="tasks" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-xl bg-gradient-to-br from-white to-[#25C9D0]/5">
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
                <div className="space-y-3">
                  {actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-white rounded-[12px] border-l-4 border-[#25C9D0] hover:border-[#14B8A6] hover:shadow-md transition-all duration-200"
                    >
                      {/* Task Title */}
                      <p className="font-semibold text-slate-600 text-sm mb-3 leading-relaxed">
                        {item.task}
                      </p>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#25C9D0]/10 text-[#25C9D0] border border-[#25C9D0]/20">
                          <User className="h-3 w-3" />
                          {item.assignee || t('results.sections.actionItems.unassigned')}
                        </div>
                        {item.dueDate && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="h-3 w-3" />
                            {item.dueDate}
                          </div>
                        )}
                        {item.priority && (
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </div>
                        )}
                      </div>

                      {/* Technical Notes */}
                      {item.technicalNotes && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            <Zap className="h-3 w-3 text-[#25C9D0]" />
                            {t('results.sections.actionItems.technicalNotes')}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.technicalNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          {/* Decisions Tab - Creative & Modern Design */}
          <TabsContent value="decisions" className="mt-6">
          <Card className="glass border-[#14B8A6]/20 shadow-xl bg-gradient-to-br from-white via-[#14B8A6]/5 to-white overflow-hidden">
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
                <div className="text-center py-16">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-[#25C9D0]/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6]/10 to-[#25C9D0]/10 flex items-center justify-center border-2 border-[#14B8A6]/20">
                      <Target className="h-10 w-10 text-[#14B8A6]" />
                    </div>
                  </div>
                  <p className="text-slate-500 italic text-sm">{t('results.sections.decisions.noDecisions')}</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Decorative timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#14B8A6]/30 via-[#25C9D0]/30 to-[#14B8A6]/30 hidden md:block"></div>
                  
                  <div className="space-y-4">
                    {keyDecisions.map((decision, index) => (
                      <div
                        key={index}
                        className="group relative flex items-start gap-4 md:gap-6"
                      >
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          <div className="relative">
                            <div className="absolute inset-0 bg-[#14B8A6] rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F9488] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-white">
                              <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={2.5} />
                            </div>
                          </div>
                          {/* Decision number badge */}
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                            {index + 1}
                          </div>
                        </div>

                        {/* Decision content card */}
                        <div className="flex-1 min-w-0">
                          <div className="group/card relative p-5 md:p-6 bg-white rounded-[16px] border-2 border-[#14B8A6]/20 shadow-md hover:shadow-xl transition-all duration-300 hover:border-[#14B8A6]/40 hover:-translate-y-1 overflow-hidden">
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/0 to-[#25C9D0]/0 group-hover/card:from-[#14B8A6]/5 group-hover/card:to-[#25C9D0]/5 transition-all duration-300"></div>
                            
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#14B8A6]/10 to-transparent rounded-bl-[100px]"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Flag className="h-4 w-4 text-[#14B8A6]" />
                                    <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wide">
                                      {t('results.sections.decisions.title')} #{index + 1}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 font-semibold leading-relaxed text-base md:text-lg group-hover/card:text-slate-600 transition-colors">
                                    {decision}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Status indicator */}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20">
                                  <CheckCircleIcon className="h-3.5 w-3.5 text-[#14B8A6]" />
                                  <span className="text-xs font-semibold text-[#0F9488]">Confirmed</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          {/* Summary Tab - Clean & Simple Design */}
          <TabsContent value="summary" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-xl bg-gradient-to-br from-white to-[#25C9D0]/5">
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
              <div className="space-y-8">
                {/* Blockers Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#25C9D0]/10 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-[#25C9D0]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-600 text-base">
                        {t('results.sections.summary.blockersToFollowUp')}
                      </h4>
                    </div>
                  </div>
                  {summary.blockersToFollowUp.length > 0 ? (
                    <div className="space-y-2 pl-13">
                      {summary.blockersToFollowUp.map((blocker, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#25C9D0]/5 rounded-[10px] border-l-4 border-[#25C9D0] hover:bg-[#25C9D0]/10 transition-colors"
                        >
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {blocker}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-13">{t('results.sections.summary.noBlockers')}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200"></div>

                {/* Priority Tasks Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#25C9D0]/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-[#25C9D0]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-600 text-base">
                        {t('results.sections.summary.priorityTasks')}
                      </h4>
                    </div>
                  </div>
                  {summary.priorityTasks.length > 0 ? (
                    <div className="space-y-2 pl-13">
                      {summary.priorityTasks.map((task, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#25C9D0]/5 rounded-[10px] border-l-4 border-[#25C9D0] hover:bg-[#25C9D0]/10 transition-colors"
                        >
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {task}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-13">{t('results.sections.summary.noPriorityTasks')}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200"></div>

                {/* Responsibilities Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[#25C9D0]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#25C9D0]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-600 text-base">
                        {t('results.sections.summary.responsibilities')}
                      </h4>
                    </div>
                  </div>
                  {summary.responsibilities.length > 0 ? (
                    <div className="space-y-2 pl-13">
                      {summary.responsibilities.map((resp, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#25C9D0]/5 rounded-[10px] border-l-4 border-[#25C9D0] hover:bg-[#25C9D0]/10 transition-colors"
                        >
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {resp.task}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white text-xs font-bold">
                              {resp.person.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">
                              {resp.person}
                            </span>
                            {resp.deadline && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock className="h-3 w-3" />
                                {resp.deadline}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm pl-13">{t('results.sections.summary.noResponsibilities')}</p>
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
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
