/**
 * FileUploader - Upload .proviso and .json files
 *
 * Supports:
 * - .proviso files (ProViso code)
 * - .json files (financial data)
 * - Drag and drop
 * - Click to browse
 */
import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, FileJson, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { useProViso } from '../context';
import { Button } from './base/Button';
import { trackFileUploaded } from '../utils/analytics';

type FileType = 'proviso' | 'json' | 'unknown';
type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

interface UploadResult {
  status: UploadStatus;
  fileName: string;
  fileType: FileType;
  message?: string;
}

/**
 * Detect file type from extension
 */
function detectFileType(fileName: string): FileType {
  if (fileName.endsWith('.proviso')) return 'proviso';
  if (fileName.endsWith('.json')) return 'json';
  return 'unknown';
}

interface FileUploaderProps {
  className?: string;
  /** Callback when upload completes successfully */
  onSuccess?: (fileType: FileType, fileName: string) => void;
  /** Show compact version */
  compact?: boolean;
}

export function FileUploader({
  className = '',
  onSuccess,
  compact = false,
}: FileUploaderProps) {
  const { loadFromCode, loadFinancials, isLoading } = useProViso();
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Process a file
  const processFile = useCallback(async (file: File) => {
    const fileType = detectFileType(file.name);

    if (fileType === 'unknown') {
      setResult({
        status: 'error',
        fileName: file.name,
        fileType,
        message: 'Unsupported file type. Please upload .proviso or .json files.',
      });
      return;
    }

    setUploadLoading(true);
    setResult({
      status: 'loading',
      fileName: file.name,
      fileType,
    });

    try {
      const text = await file.text();

      if (fileType === 'proviso') {
        const success = await loadFromCode(text);
        if (success) {
          trackFileUploaded('proviso');
          setResult({
            status: 'success',
            fileName: file.name,
            fileType,
            message: 'ProViso code loaded successfully',
          });
          onSuccess?.(fileType, file.name);
        } else {
          setResult({
            status: 'error',
            fileName: file.name,
            fileType,
            message: 'Failed to parse ProViso code. Check syntax.',
          });
        }
      } else if (fileType === 'json') {
        try {
          const data = JSON.parse(text);

          // Validate it looks like financial data
          if (typeof data !== 'object' || data === null) {
            throw new Error('JSON must be an object');
          }

          // Check if it has numeric values (simple validation)
          const hasNumbers = Object.values(data).some((v) => typeof v === 'number');
          if (!hasNumbers) {
            throw new Error('JSON must contain numeric financial values');
          }

          loadFinancials(data as Record<string, number>);
          trackFileUploaded('json');
          setResult({
            status: 'success',
            fileName: file.name,
            fileType,
            message: `Loaded ${Object.keys(data).length} financial values`,
          });
          onSuccess?.(fileType, file.name);
        } catch (e) {
          setResult({
            status: 'error',
            fileName: file.name,
            fileType,
            message: `Invalid JSON: ${(e as Error).message}`,
          });
        }
      }
    } catch (e) {
      setResult({
        status: 'error',
        fileName: file.name,
        fileType,
        message: `Failed to read file: ${(e as Error).message}`,
      });
    } finally {
      setUploadLoading(false);
    }
  }, [loadFromCode, loadFinancials, onSuccess]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [processFile]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Handle click to browse
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Clear result
  const handleClearResult = useCallback(() => {
    setResult(null);
  }, []);

  const loading = uploadLoading || isLoading;

  // Compact version - just a button
  if (compact) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          accept=".proviso,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="secondary"
          size="sm"
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          onClick={handleClick}
          disabled={loading}
        >
          Upload File
        </Button>
        {result && result.status === 'error' && (
          <p className="text-red-400 text-xs mt-1">{result.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white">Upload Files</h3>
        <p className="text-sm text-slate-400">
          Load ProViso code (.proviso) or financial data (.json)
        </p>
      </div>

      {/* Drop zone */}
      <div className="p-5">
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? 'border-accent-500 bg-accent-500/10'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
            }
            ${loading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".proviso,.json"
            onChange={handleFileChange}
            className="hidden"
          />

          {loading ? (
            <Loader2 className="w-10 h-10 text-accent-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          )}

          <p className="text-white font-medium mb-1">
            {isDragging ? 'Drop file here' : 'Drag and drop or click to browse'}
          </p>
          <p className="text-sm text-slate-400">
            Supports .proviso and .json files
          </p>
        </div>

        {/* Result message */}
        {result && (
          <div
            className={`
              mt-4 p-4 rounded-lg flex items-start gap-3
              ${result.status === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : result.status === 'error'
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-slate-800 border border-slate-700'
              }
            `}
          >
            {result.status === 'loading' && (
              <Loader2 className="w-5 h-5 text-accent-500 animate-spin flex-shrink-0 mt-0.5" />
            )}
            {result.status === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            )}
            {result.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {result.fileType === 'proviso' && (
                  <FileText className="w-4 h-4 text-slate-400" />
                )}
                {result.fileType === 'json' && (
                  <FileJson className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-white font-medium truncate">
                  {result.fileName}
                </span>
              </div>
              {result.message && (
                <p className={`text-sm mt-1 ${
                  result.status === 'success' ? 'text-green-400' :
                  result.status === 'error' ? 'text-red-400' :
                  'text-slate-400'
                }`}>
                  {result.message}
                </p>
              )}
            </div>

            {result.status !== 'loading' && (
              <button
                onClick={handleClearResult}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* File type hints */}
      <div className="px-5 py-4 border-t border-slate-800 bg-slate-800/30">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-teal-400 mt-0.5" />
            <div>
              <div className="text-slate-300 font-medium">.proviso</div>
              <div className="text-slate-500">ProViso agreement code</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileJson className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <div className="text-slate-300 font-medium">.json</div>
              <div className="text-slate-500">Financial data values</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
