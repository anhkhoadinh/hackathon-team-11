'use client';

import { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo, X, Sparkles, CheckCircle2, Clock, DollarSign, Zap, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { formatFileSize, estimateCost } from '@/lib/utils';

type Language = 'vi' | 'en' | 'ja';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}

const languages: Array<{ value: Language; label: string; flag: string }> = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'mpeg'];

export default function FileUpload({ onFileSelect, disabled, language = 'en', onLanguageChange }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 25MB limit. Current size: ${formatFileSize(file.size)}`;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return `Invalid file type. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleProcess = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const estimatedDuration = selectedFile ? Math.ceil(selectedFile.size / (1024 * 1024) * 2) : 0;
  const estimatedCostValue = selectedFile ? estimateCost(estimatedDuration) : 0;
  const isVideo = selectedFile?.type.startsWith('video/') || selectedFile?.name.match(/\.(mp4|webm|mpeg)$/i);

  return (
    <div className="space-y-8">
      {/* Hero Section - Empty State */}
      {!selectedFile && (
        <div className="relative">
          {/* Animated background gradient */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[24px]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#25C9D0]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7DE5EA]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <Card className="glass border-[#25C9D0]/20 shadow-2xl overflow-hidden relative scale-in">
            <CardContent className="p-0">
              <div
                className={`relative border-2 border-dashed rounded-[20px] m-6 p-16 text-center transition-all duration-500 ${
                  dragActive
                    ? 'border-[#25C9D0] bg-gradient-to-br from-[#25C9D0]/10 to-[#7DE5EA]/10 scale-[1.02] pulse-glow'
                    : error
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-slate-300 hover:border-[#25C9D0]/60 hover:bg-gradient-to-br hover:from-slate-50 hover:to-[#25C9D0]/5'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleChange}
                  accept=".mp3,.wav,.m4a,.mp4,.webm,.mpeg,audio/*,video/mp4,video/webm"
                  disabled={disabled}
                />

                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  {/* Animated Icon */}
                  <div className="relative mb-8 float-animation">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] p-8 rounded-[24px] shadow-xl shadow-[#25C9D0]/30">
                      <Upload className="h-16 w-16 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Hero Text */}
                  <h3 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    Upload Your Meeting Recording
                  </h3>
                  <p className="text-lg text-slate-600 mb-3 max-w-2xl">
                    Drag & drop your file here, or{' '}
                    <span className="text-[#25C9D0] font-bold underline decoration-2 underline-offset-4">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-slate-500 mb-8">
                    Transform meetings into structured insights with AI
                  </p>

                  {/* Format Support */}
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-[12px] border border-slate-200 shadow-sm">
                      <FileAudio className="h-5 w-5 text-[#25C9D0]" />
                      <span className="text-sm font-semibold text-slate-700">Audio Files</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-[12px] border border-slate-200 shadow-sm">
                      <FileVideo className="h-5 w-5 text-[#25C9D0]" />
                      <span className="text-sm font-semibold text-slate-700">Video Files</span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>MP3, WAV, M4A, MP4, WebM • Max 25MB</span>
                  </div>

                  {/* Transcript Language Selector */}
                  {onLanguageChange && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-[8px] border border-slate-200 shadow-sm">
                        <Globe className="h-3.5 w-3.5 text-[#25C9D0]" />
                        <label htmlFor="transcript-language" className="text-xs font-semibold text-slate-700">
                          Transcript Language:
                        </label>
                        <select
                          id="transcript-language"
                          value={language}
                          onChange={(e) => onLanguageChange(e.target.value as Language)}
                          className="ml-1 px-2 py-1 rounded-[6px] border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all cursor-pointer hover:border-[#25C9D0]/50"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.flag} {lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </label>

                {error && (
                  <div className="mt-6 p-4 bg-red-50/50 border-2 border-red-200 rounded-[12px] fade-in-up">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-6">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-[12px] border border-slate-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-[10px] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">AI-Powered</h4>
                    <p className="text-xs text-slate-600">OpenAI Whisper + GPT-4</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-[12px] border border-slate-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-[10px] flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Fast Processing</h4>
                    <p className="text-xs text-slate-600">Results in minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-[12px] border border-slate-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-[10px] flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">Affordable</h4>
                    <p className="text-xs text-slate-600">~$0.40 per 60 min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Selected State */}
      {selectedFile && (
        <Card className="glass border-[#25C9D0]/30 shadow-2xl overflow-hidden scale-in card-hover">
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-6 flex-1">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-[16px] blur-lg opacity-40"></div>
                    <div className="relative w-20 h-20 rounded-[16px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center shadow-xl shadow-[#25C9D0]/30">
                      {isVideo ? (
                        <FileVideo className="h-10 w-10 text-white" strokeWidth={2} />
                      ) : (
                        <FileAudio className="h-10 w-10 text-white" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xl mb-2 truncate">
                    {selectedFile.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {formatFileSize(selectedFile.size)} • {isVideo ? 'Video' : 'Audio'} File
                  </p>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#25C9D0]/10 border border-[#25C9D0]/20 text-[#1BA1A8] rounded-[10px] text-sm font-semibold">
                      <Clock className="h-4 w-4" />
                      <span>~{estimatedDuration} min</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#0F9488] rounded-[10px] text-sm font-semibold">
                      <DollarSign className="h-4 w-4" />
                      <span>${estimatedCostValue.toFixed(2)} est.</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#25C9D0]/10 border border-[#25C9D0]/20 text-[#1BA1A8] rounded-[10px] text-sm font-semibold">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Analysis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-all duration-300 p-3 hover:bg-red-50 rounded-[10px] hover:scale-110"
                  title="Remove file"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50/50 border-2 border-red-200 rounded-[12px] fade-in-up">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* CTA Button */}
            {!error && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleProcess}
                  disabled={disabled}
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto text-lg px-12 primary-glow"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  Start AI Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
