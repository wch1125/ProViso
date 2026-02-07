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
  /** When true, show a notice that uploads are disabled in the public demo */
  demoMode?: boolean;
}

export function FileUploader({
  className = '',
  onSuccess,
  compact = false,
  demoMode = false,
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

  // Demo mode: show disabled state with explanation
  if (demoMode) {
    return (
      <div className={`bg-surface-0/50 border border-surface-2 rounded-xl p-6 text-center ${className}`}>
        <Upload className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
        <p className="text-text-secondary font-medium mb-1">File uploads disabled in demo</p>
        <p className="text-sm text-text-muted">
          This demo uses pre-loaded sample data. In a live deployment, you can upload your own .proviso and .json files.
        </p>
      </div>
    );
  }

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
          <p className="text-danger text-xs mt-1">{result.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-surface-0/50 border border-surface-2 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-DEFAULT">
        <h3 className="text-lg font-semibold text-text-primary">Upload Files</h3>
        <p className="text-sm text-text-tertiary">
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
              ? 'border-gold-500 bg-gold-500/10'
              : 'border-border-DEFAULT hover:border-border-strong hover:bg-surface-2/50'
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
            <Loader2 className="w-10 h-10 text-gold-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-4" />
          )}

          <p className="text-text-primary font-medium mb-1">
            {isDragging ? 'Drop file here' : 'Drag and drop or click to browse'}
          </p>
          <p className="text-sm text-text-tertiary">
            Supports .proviso and .json files
          </p>
        </div>

        {/* Result message */}
        {result && (
          <div
            className={`
              mt-4 p-4 rounded-lg flex items-start gap-3
              ${result.status === 'success'
                ? 'bg-success/10 border border-success/20'
                : result.status === 'error'
                ? 'bg-danger/10 border border-danger/20'
                : 'bg-surface-2 border border-border-DEFAULT'
              }
            `}
          >
            {result.status === 'loading' && (
              <Loader2 className="w-5 h-5 text-gold-500 animate-spin flex-shrink-0 mt-0.5" />
            )}
            {result.status === 'success' && (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            )}
            {result.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {result.fileType === 'proviso' && (
                  <FileText className="w-4 h-4 text-text-tertiary" />
                )}
                {result.fileType === 'json' && (
                  <FileJson className="w-4 h-4 text-text-tertiary" />
                )}
                <span className="text-text-primary font-medium truncate">
                  {result.fileName}
                </span>
              </div>
              {result.message && (
                <p className={`text-sm mt-1 ${
                  result.status === 'success' ? 'text-success' :
                  result.status === 'error' ? 'text-danger' :
                  'text-text-tertiary'
                }`}>
                  {result.message}
                </p>
              )}
            </div>

            {result.status !== 'loading' && (
              <button
                onClick={handleClearResult}
                className="p-1 rounded hover:bg-surface-3 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* File type hints */}
      <div className="px-5 py-4 border-t border-border-DEFAULT bg-surface-2/30">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-info mt-0.5" />
            <div>
              <div className="text-text-secondary font-medium">.proviso</div>
              <div className="text-text-muted">ProViso agreement code</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileJson className="w-4 h-4 text-warning mt-0.5" />
            <div>
              <div className="text-text-secondary font-medium">.json</div>
              <div className="text-text-muted">Financial data values</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
