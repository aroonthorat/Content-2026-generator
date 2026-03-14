
import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  disabled: boolean;
  id?: string;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled, id = 'file-upload', label }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && !disabled) {
      onFileSelect(files);
    }
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file: File) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
          onFileSelect(event.dataTransfer.files);
      }
    }
  }, [onFileSelect, disabled]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    if (!disabled) {
       document.getElementById(id)?.click();
    }
  };

  return (
    <div 
      className={`relative p-4 rounded-xl bg-surface backdrop-blur-sm border border-border transition-opacity ${disabled ? 'opacity-50' : ''}`}
    >
      <div 
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${
          isDragging 
            ? 'border-accent bg-accent/10' 
            : 'border-primary/50 hover:border-accent'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadIcon className={`w-8 h-8 transition-colors ${isDragging ? 'text-accent' : 'text-textSub'}`} />
          <div className="text-center text-xs text-textSub">
            <p className={`font-semibold ${isDragging ? 'text-accent' : 'text-primary'}`}>
              {label || 'Upload Images'}
            </p>
            <p className="text-[10px] text-textMuted">Drag & drop supported</p>
          </div>
        </div>
        <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={disabled} multiple />
      </div>
    </div>
  );
};

export default FileUpload;
