'use client';

import { useState, useMemo } from 'react';
import { 
  Download, Copy, CheckCircle, FileText, ListTodo, Target, Users, Search, X, 
  CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Calendar, 
  Sparkles, User, Award, Zap, ArrowRight, ExternalLink 
} from 'lucide-react';
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
        <mark key={i} className="bg-[#25C9D0]/30 text-slate-900 px-1 rounded-md">
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

  // Get priority badge color
  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'bg-slate-100 text-slate-700 border-slate-200';
    const p = priority.toLowerCase();
    if (p.includes('high') || p.includes('cao')) return 'bg-red-100 text-red-700 border-red-200';
    if (p.includes('medium') || p.includes('trung')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (p.includes('low') || p.includes('thấp')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Get workload badge color
  const getWorkloadColor = (status: string) => {
    if (status === 'overloaded') return 'bg-red-100 text-red-700 border-red-300';
    if (status === 'normal') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (status === 'free') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getWorkloadIcon = (status: string) => {
    if (status === 'overloaded') return '🔥';
    if (status === 'normal') return '✅';
    if (status === 'free') return '🌟';
    return '📊';
  };

  const CopyButton = ({ section, text }: { section: string; text: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, section)}
      className="hover:bg-[#25C9D0]/10 hover:text-[#25C9D0] transition-all duration-300"
    >
      {copiedSection === section ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-[#25C9D0]" />
          <span className="text-[#25C9D0] font-semibold">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </>
      )}
    </Button>
  );

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header Card */}
      <Card className="glass border-[#25C9D0]/20 shadow-xl card-hover overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25C9D0] via-[#14B8A6] to-[#25C9D0] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]"></div>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#25C9D0]/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold gradient-text">
                    Meeting Analysis Complete
                  </CardTitle>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
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
            <div className="flex gap-3">
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                variant="primary"
                className="shadow-xl hover:shadow-2xl"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline" 
                size="lg"
                className="border-2 hover:border-[#25C9D0]/50"
              >
                Xử lý file khác
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto glass border-[#25C9D0]/20 p-2 gap-2 shadow-lg">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Tiến độ</span>
            <span className="sm:hidden">Progress</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
              {personalProgress.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Công việc</span>
            <span className="sm:hidden">Tasks</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
              {actionItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Quyết định</span>
            <span className="sm:hidden">Decisions</span>
            {keyDecisions.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#25C9D0]/20 text-[#25C9D0] rounded-full font-bold">
                {keyDecisions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng kết</span>
            <span className="sm:hidden">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Transcript</span>
            <span className="sm:hidden">Text</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Card */}
            <Card className="glass border-[#25C9D0]/20 shadow-lg card-hover">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Điểm danh</CardTitle>
                  </div>
                  <CopyButton
                    section="attendance"
                    text={`Có mặt: ${attendance.present.join(', ')}\nVắng: ${attendance.absent.map(a => a.name + (a.reason ? ` (${a.reason})` : '')).join(', ')}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Present */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#25C9D0]" />
                    Có mặt ({attendance.present.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {attendance.present.length > 0 ? (
                      attendance.present.map((person, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-md"
                        >
                          <User className="h-4 w-4" />
                          {person}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">Không có thông tin</p>
                    )}
                  </div>
                </div>

                {/* Absent */}
                {attendance.absent.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Vắng mặt ({attendance.absent.length})
                    </h4>
                    <div className="space-y-2">
                      {attendance.absent.map((person, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-[12px] border-2 border-red-200 hover:border-red-300 transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <span className="font-bold text-red-900 block">{person.name}</span>
                              {person.reason && (
                                <span className="text-sm text-red-700 mt-1 flex items-center gap-2">
                                  <AlertCircle className="h-3.5 w-3.5" />
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
            <Card className="glass border-[#25C9D0]/20 shadow-lg card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Đánh giá Workload</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workload.length > 0 ? (
                    workload.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="group flex items-center justify-between p-4 bg-white rounded-[12px] border-2 border-slate-200 hover:border-[#25C9D0]/50 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getWorkloadIcon(item.status)}</span>
                          <span className="font-bold text-slate-900">{item.member}</span>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-bold border-2 ${getWorkloadColor(item.status)}`}>
                          {item.status === 'overloaded' && 'Quá tải'}
                          {item.status === 'normal' && 'Bình thường'}
                          {item.status === 'free' && 'Rảnh'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center py-8">Không có thông tin đánh giá workload</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Cập nhật tiến độ cá nhân</CardTitle>
                </div>
                <CopyButton
                  section="progress"
                  text={personalProgress.map(p => 
                    `${p.member}:\n- Hôm qua: ${p.yesterday.join(', ')}\n- Hôm nay: ${p.today.join(', ')}\n- Blocker: ${p.blockers.length > 0 ? p.blockers.join(', ') : 'Không có'}`
                  ).join('\n\n')}
                />
              </div>
            </CardHeader>
            <CardContent>
              {personalProgress.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 italic">Không có thông tin cập nhật tiến độ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {personalProgress.map((progress, idx) => (
                    <div 
                      key={idx} 
                      className="group p-6 bg-gradient-to-br from-white to-slate-50 rounded-[16px] border-2 border-slate-200 hover:border-[#25C9D0]/50 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Member Header */}
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {progress.member.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-xl text-slate-900">{progress.member}</h3>
                      </div>
                      
                      <div className="space-y-5">
                        {/* Yesterday */}
                        <div>
                          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                            Hôm qua đã làm
                          </h4>
                          {progress.yesterday.length > 0 ? (
                            <ul className="space-y-2">
                              {progress.yesterday.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 pl-8">
                                  <span className="text-[#25C9D0] font-bold mt-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic pl-8">Không có thông tin</p>
                          )}
                        </div>

                        {/* Today */}
                        <div>
                          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            Hôm nay làm
                          </h4>
                          {progress.today.length > 0 ? (
                            <ul className="space-y-2">
                              {progress.today.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 pl-8">
                                  <span className="text-[#25C9D0] font-bold mt-1">•</span>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic pl-8">Không có thông tin</p>
                          )}
                        </div>

                        {/* Blockers */}
                        {progress.blockers.length > 0 && (
                          <div className="p-4 bg-amber-50 rounded-[12px] border-2 border-amber-200">
                            <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              Vướng mắc/Blocker
                            </h4>
                            <ul className="space-y-2">
                              {progress.blockers.map((blocker, i) => (
                                <li key={i} className="flex items-start gap-2 text-amber-800">
                                  <span className="text-amber-600 font-bold mt-1">⚠</span>
                                  <span className="font-medium">{blocker}</span>
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

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <ListTodo className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Giao việc mới & Điều chuyển</CardTitle>
                </div>
                <CopyButton
                  section="tasks"
                  text={actionItems.map(item => 
                    `${item.task} - ${item.assignee}${item.dueDate ? ` (${item.dueDate})` : ''}${item.priority ? ` [${item.priority}]` : ''}`
                  ).join('\n')}
                />
              </div>
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <ListTodo className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 italic">Không có công việc mới được giao</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="group p-6 bg-white rounded-[16px] border-2 border-slate-200 hover:border-[#25C9D0]/50 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="w-6 h-6 rounded-md border-2 border-slate-300 group-hover:border-[#25C9D0] flex items-center justify-center transition-colors">
                            <div className="w-3 h-3 rounded-sm bg-slate-200 group-hover:bg-[#25C9D0] transition-colors"></div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-lg mb-4 leading-relaxed">
                            {item.task}
                          </p>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold bg-[#25C9D0]/10 text-[#25C9D0] border-2 border-[#25C9D0]/20">
                              <User className="h-4 w-4" />
                              {item.assignee || 'Chưa phân công'}
                            </div>
                            {item.dueDate && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold bg-blue-50 text-blue-700 border-2 border-blue-200">
                                <Clock className="h-4 w-4" />
                                {item.dueDate}
                              </div>
                            )}
                            {item.priority && (
                              <div className={`inline-flex items-center px-4 py-2 rounded-[10px] text-sm font-bold border-2 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </div>
                            )}
                          </div>

                          {item.technicalNotes && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-[12px] border-2 border-slate-200">
                              <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-[#25C9D0]" />
                                Yêu cầu kỹ thuật:
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

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Chốt quyết định</CardTitle>
                </div>
                <CopyButton section="decisions" text={keyDecisions.join('\n')} />
              </div>
            </CardHeader>
            <CardContent>
              {keyDecisions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <Target className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 italic">Không có quyết định quan trọng nào được ghi nhận</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {keyDecisions.map((decision, index) => (
                    <div
                      key={index}
                      className="group relative p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-[16px] border-l-4 border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[12px] flex items-center justify-center shadow-lg">
                            <Target className="h-6 w-6 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-slate-800 font-semibold leading-relaxed text-base">
                              {decision}
                            </p>
                            <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">
                              Decision #{index + 1}
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

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Tổng kết & Bước tiếp theo</CardTitle>
                </div>
                <CopyButton
                  section="summary"
                  text={`Vướng mắc cần follow-up:\n${summary.blockersToFollowUp.join('\n')}\n\nCông việc ưu tiên:\n${summary.priorityTasks.join('\n')}\n\nTrách nhiệm:\n${summary.responsibilities.map(r => `${r.person}: ${r.task}${r.deadline ? ` (${r.deadline})` : ''}`).join('\n')}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Blockers */}
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[10px] bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    Vướng mắc cần follow-up
                  </h4>
                  {summary.blockersToFollowUp.length > 0 ? (
                    <ul className="space-y-3">
                      {summary.blockersToFollowUp.map((blocker, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-4 bg-amber-50 rounded-[12px] border-2 border-amber-200 hover:border-amber-300 transition-all">
                          <ArrowRight className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 font-medium">{blocker}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic pl-11">Không có vướng mắc cần follow-up</p>
                  )}
                </div>

                {/* Priority Tasks */}
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[10px] bg-[#25C9D0]/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-[#25C9D0]" />
                    </div>
                    Công việc ưu tiên trong ngày
                  </h4>
                  {summary.priorityTasks.length > 0 ? (
                    <ul className="space-y-3">
                      {summary.priorityTasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-4 bg-[#25C9D0]/5 rounded-[12px] border-2 border-[#25C9D0]/20 hover:border-[#25C9D0]/40 transition-all">
                          <ArrowRight className="h-5 w-5 text-[#25C9D0] mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 font-medium">{task}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic pl-11">Không có công việc ưu tiên được ghi nhận</p>
                  )}
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[10px] bg-violet-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-violet-600" />
                    </div>
                    Trách nhiệm & Deadline
                  </h4>
                  {summary.responsibilities.length > 0 ? (
                    <div className="space-y-4">
                      {summary.responsibilities.map((resp, idx) => (
                        <div 
                          key={idx} 
                          className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-[16px] border-2 border-violet-200 hover:border-violet-300 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 mb-3 text-base">{resp.task}</p>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-violet-600" />
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-violet-100 text-violet-700 border border-violet-300">
                                  {resp.person}
                                </span>
                              </div>
                            </div>
                            {resp.deadline && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold bg-blue-50 text-blue-700 border-2 border-blue-200 whitespace-nowrap">
                                <Clock className="h-4 w-4" />
                                {resp.deadline}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic pl-11">Không có trách nhiệm được ghi nhận</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="mt-6">
          <Card className="glass border-[#25C9D0]/20 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Full Transcript</CardTitle>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm trong transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 pr-10 py-3 border-2 border-slate-200 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] w-full sm:w-72 transition-all"
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
                <p className="text-sm text-[#25C9D0] font-semibold mt-2 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Tìm thấy {filteredSegments.length} đoạn phù hợp
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSegments.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 italic">Không tìm thấy đoạn nào phù hợp.</p>
                  </div>
                ) : (
                  filteredSegments.map((segment) => (
                    <div 
                      key={segment.id} 
                      className="flex items-start gap-4 p-4 rounded-[12px] hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex-shrink-0 text-xs font-mono font-bold text-[#25C9D0] bg-[#25C9D0]/10 px-3 py-2 rounded-[8px] border border-[#25C9D0]/20">
                        {formatTimestamp(segment.start)}
                      </span>
                      <p className="text-slate-700 pt-1 leading-relaxed font-medium">
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
