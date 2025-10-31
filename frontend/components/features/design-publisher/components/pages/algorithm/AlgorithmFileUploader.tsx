interface AlgorithmFileUploaderProps {
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
  algoRequired: boolean;
  fileTypeError: string | null;
  onFileChange: (file: File) => void;
}

export const AlgorithmFileUploader = ({
  algoFile,
  algoResponse,
  algoError,
  algoRequired,
  fileTypeError,
  onFileChange
}: AlgorithmFileUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validExtensions = ['.tsx', '.ts', '.js'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (isValid) {
        onFileChange(file);
      }
    }
  };

  const hasError = algoRequired || fileTypeError;

  return (
    <>
      <input
        type="file"
        accept=".tsx,.ts,.js"
        onChange={handleFileChange}
        className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
      />
      <div className={`h-full border border-dashed ${hasError ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!hasError && 'group-hover:border-white/40'} transition-colors overflow-hidden`}>
        {algoFile ? (
          <pre className="p-6 w-full h-full overflow-auto text-sm text-white/80 font-mono">
            {algoResponse || '// Processing...'}
          </pre>
        ) : (
          <div className="text-center p-4">
            <div className={`text-4xl mb-3 ${hasError ? 'text-red-400' : 'text-white/40'}`}>+</div>
            <div className={`text-sm ${hasError ? 'text-red-400' : 'text-white/40'} flex flex-col gap-1`}>
              {algoRequired ? 'Algorithm file is required' : 'Click or drag to upload algorithm'}
              <span className="text-xs text-white/30">Only .tsx, .ts or .js files are allowed</span>
            </div>
          </div>
        )}
      </div>
      {(algoError || fileTypeError) && (
        <div className="mt-2 text-red-400 text-sm">
          <span className="font-mono">Error: </span>{algoError || fileTypeError}
        </div>
      )}
    </>
  );
};

