'use client';

import { useCallback, useState } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { formatFileSize, estimateCost } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'mpeg'];

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
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

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
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

          {!selectedFile ? (
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your audio/video file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supported: MP3, WAV, M4A, MP4, WebM (max 25MB)
              </p>
            </label>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <FileAudio className="h-10 w-10 text-blue-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 break-all">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p>?? Estimated processing: ~{estimatedDuration} min</p>
                    <p>?? Estimated cost: ${estimatedCostValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {selectedFile && !error && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleProcess}
              disabled={disabled}
              size="lg"
              className="w-full sm:w-auto"
            >
              Process Meeting Recording
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

