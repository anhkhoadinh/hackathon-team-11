'use client';

import { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { formatFileSize, estimateCost } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  language?: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'mpeg'];

export default function FileUpload({ onFileSelect, disabled, language }: FileUploadProps) {
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
    <div className="space-y-6">
      {/* Empty State */}
      {!selectedFile && (
        <Card className="glass border-slate-200/50 shadow-xl">
          <CardContent className="p-12">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 pulse-glow'
                  : error
                  ? 'border-red-300 bg-red-50/50'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
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
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-full">
                    <Upload className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Drop your meeting recording here
                </h3>
                <p className="text-slate-600 mb-6">
                  or <span className="text-indigo-600 font-semibold">click to browse</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    <span>Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    <span>Video</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Supported: MP3, WAV, M4A, MP4, WebM (max 25MB)
                </p>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Selected State */}
      {selectedFile && (
        <Card className="glass border-slate-200/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    {isVideo ? (
                      <FileVideo className="h-8 w-8 text-white" />
                    ) : (
                      <FileAudio className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1 truncate">
                    {selectedFile.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      <span>~{estimatedDuration} min</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-sm font-medium">
                      <span>${estimatedCostValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!error && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleProcess}
                  disabled={disabled}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process Meeting Recording
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

