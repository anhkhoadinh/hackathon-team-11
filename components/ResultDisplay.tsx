'use client';

import { useState, useMemo } from 'react';
import { Download, Copy, CheckCircle, FileText, ListTodo, Target, Users, Search, X, CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
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

  const analysis = result.analysis;
  const attendance = analysis.attendance || { present: [], absent: [] };
  const personalProgress = analysis.personalProgress || [];
  const workload = analysis.workload || [];
  const actionItems = analysis.actionItems || [];
  const keyDecisions = analysis.keyDecisions || [];
  const summary = analysis.summary || { blockersToFollowUp: [], priorityTasks: [], responsibilities: [] };

  // Get priority badge color
  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'bg-slate-100 text-slate-700';
    const p = priority.toLowerCase();
    if (p.includes('high') || p.includes('cao')) return 'bg-red-100 text-red-700';
    if (p.includes('medium') || p.includes('trung')) return 'bg-yellow-100 text-yellow-700';
    if (p.includes('low') || p.includes('thấp')) return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Get workload badge color
  const getWorkloadColor = (status: string) => {
    if (status === 'overloaded') return 'bg-red-100 text-red-700';
    if (status === 'normal') return 'bg-blue-100 text-blue-700';
    if (status === 'free') return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card className="glass border-slate-200/50 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Phân tích Daily Meeting</CardTitle>
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
                Xử lý file khác
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto glass border-slate-200/50 p-1.5 gap-1">
          <TabsTrigger value="overview">
            <Users className="h-4 w-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tiến độ ({personalProgress.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            Công việc ({actionItems.length})
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <Target className="h-4 w-4 mr-2" />
            Quyết định ({keyDecisions.length})
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            Tổng kết
          </TabsTrigger>
          <TabsTrigger value="transcript">
            <Search className="h-4 w-4 mr-2" />
            Transcript
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Điểm danh & Workload */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Attendance */}
            <Card className="glass border-slate-200/50 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-slate-900">1. Mở đầu & Điểm danh</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(
                      `Có mặt: ${attendance.present.join(', ')}\nVắng: ${attendance.absent.map(a => a.name + (a.reason ? ` (${a.reason})` : '')).join(', ')}`,
                      'attendance'
                    )}
                    className="hover:bg-slate-100"
                  >
                    {copiedSection === 'attendance' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Đã copy
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
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Có mặt ({attendance.present.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {attendance.present.length > 0 ? (
                        attendance.present.map((person, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200"
                          >
                            {person}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">Không có thông tin</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Vắng mặt ({attendance.absent.length})
                    </h4>
                    <div className="space-y-2">
                      {attendance.absent.length > 0 ? (
                        attendance.absent.map((person, idx) => (
                          <div key={idx} className="p-2 bg-red-50 rounded-lg border border-red-100">
                            <span className="font-medium text-red-900">{person.name}</span>
                            {person.reason && (
                              <span className="text-sm text-red-700 ml-2">- {person.reason}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">Không có ai vắng mặt</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workload Assessment */}
            <Card className="glass border-slate-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">3. Đánh giá Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workload.length > 0 ? (
                    workload.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-900">{item.member}</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getWorkloadColor(item.status)}`}>
                          {item.status === 'overloaded' && 'Quá tải'}
                          {item.status === 'normal' && 'Bình thường'}
                          {item.status === 'free' && 'Rảnh'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center py-4">Không có thông tin đánh giá workload</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab - Cập nhật tiến độ cá nhân */}
        <TabsContent value="progress" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">2. Cập nhật tiến độ cá nhân</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    personalProgress.map(p => 
                      `${p.member}:\n- Hôm qua: ${p.yesterday.join(', ')}\n- Hôm nay: ${p.today.join(', ')}\n- Blocker: ${p.blockers.length > 0 ? p.blockers.join(', ') : 'Không có'}`
                    ).join('\n\n'),
                    'progress'
                  )}
                  className="hover:bg-slate-100"
                >
                  {copiedSection === 'progress' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Đã copy
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
              {personalProgress.length === 0 ? (
                <p className="text-slate-500 italic text-center py-8">Không có thông tin cập nhật tiến độ</p>
              ) : (
                <div className="space-y-6">
                  {personalProgress.map((progress, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                      <h3 className="font-bold text-lg text-slate-900 mb-4">{progress.member}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Hôm qua đã làm:
                          </h4>
                          {progress.yesterday.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-6">
                              {progress.yesterday.map((task, i) => (
                                <li key={i}>{task}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic ml-6">Không có thông tin</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Hôm nay làm:
                          </h4>
                          {progress.today.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-6">
                              {progress.today.map((task, i) => (
                                <li key={i}>{task}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic ml-6">Không có thông tin</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Vướng mắc/Blocker:
                          </h4>
                          {progress.blockers.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-amber-700 ml-6">
                              {progress.blockers.map((blocker, i) => (
                                <li key={i}>{blocker}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic ml-6">Không có blocker</p>
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

        {/* Tasks Tab - Giao việc mới & điều chuyển */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">4. Giao việc mới & Điều chuyển công việc</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    actionItems.map(item => 
                      `${item.task} - ${item.assignee}${item.dueDate ? ` (${item.dueDate})` : ''}${item.priority ? ` [${item.priority}]` : ''}`
                    ).join('\n'),
                    'tasks'
                  )}
                  className="hover:bg-slate-100"
                >
                  {copiedSection === 'tasks' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Đã copy
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
              {actionItems.length === 0 ? (
                <p className="text-slate-500 italic text-center py-8">Không có công việc mới được giao</p>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded border-2 border-slate-300 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-3">{item.task}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              <Users className="h-3 w-3 mr-1.5" />
                              {item.assignee || 'Chưa phân công'}
                            </span>
                            {item.dueDate && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <Clock className="h-3 w-3 mr-1.5" />
                                {item.dueDate}
                              </span>
                            )}
                            {item.priority && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            )}
                          </div>
                          {item.technicalNotes && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-xs font-medium text-slate-700 mb-1">Yêu cầu kỹ thuật:</p>
                              <p className="text-sm text-slate-600">{item.technicalNotes}</p>
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

        {/* Key Decisions Tab */}
        <TabsContent value="decisions" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">5. Chốt quyết định</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(keyDecisions.join('\n'), 'decisions')}
                  className="hover:bg-slate-100"
                >
                  {copiedSection === 'decisions' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Đã copy
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
              {keyDecisions.length === 0 ? (
                <p className="text-slate-500 italic text-center py-8">Không có quyết định quan trọng nào được ghi nhận</p>
              ) : (
                <div className="space-y-4">
                  {keyDecisions.map((decision, index) => (
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

        {/* Summary Tab - Tổng kết & bước tiếp theo */}
        <TabsContent value="summary" className="mt-6">
          <Card className="glass border-slate-200/50 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">6. Tổng kết & Bước tiếp theo</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(
                    `Vướng mắc cần follow-up:\n${summary.blockersToFollowUp.join('\n')}\n\nCông việc ưu tiên:\n${summary.priorityTasks.join('\n')}\n\nTrách nhiệm:\n${summary.responsibilities.map(r => `${r.person}: ${r.task}${r.deadline ? ` (${r.deadline})` : ''}`).join('\n')}`,
                    'summary'
                  )}
                  className="hover:bg-slate-100"
                >
                  {copiedSection === 'summary' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Đã copy
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
              <div className="space-y-6">
                {/* Blockers to Follow-up */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Vướng mắc cần follow-up:
                  </h4>
                  {summary.blockersToFollowUp.length > 0 ? (
                    <ul className="space-y-2">
                      {summary.blockersToFollowUp.map((blocker, idx) => (
                        <li key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-slate-700">
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Không có vướng mắc cần follow-up</p>
                  )}
                </div>

                {/* Priority Tasks */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    Công việc ưu tiên trong ngày:
                  </h4>
                  {summary.priorityTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {summary.priorityTasks.map((task, idx) => (
                        <li key={idx} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-slate-700">
                          {task}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Không có công việc ưu tiên được ghi nhận</p>
                  )}
                </div>

                {/* Responsibilities */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-600" />
                    Trách nhiệm & Deadline:
                  </h4>
                  {summary.responsibilities.length > 0 ? (
                    <div className="space-y-3">
                      {summary.responsibilities.map((resp, idx) => (
                        <div key={idx} className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 mb-1">{resp.task}</p>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                {resp.person}
                              </span>
                            </div>
                            {resp.deadline && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                                <Clock className="h-3 w-3 mr-1" />
                                {resp.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Không có trách nhiệm được ghi nhận</p>
                  )}
                </div>
              </div>
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
                      placeholder="Tìm kiếm trong transcript..."
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
                        Đã copy
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
                  Tìm thấy {filteredSegments.length} đoạn phù hợp
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredSegments.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-8">Không tìm thấy đoạn nào phù hợp.</p>
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
