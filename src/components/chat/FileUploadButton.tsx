import { Plus, FileText } from "lucide-react";
import { VALID_FILE_TYPES } from "../../services/images.services";

interface FileUploadButtonProps {
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

export default function FileUploadButton({
  selectedFile,
  fileInputRef,
  onFileChange,
  onClearFile,
}: FileUploadButtonProps) {
  return (
    <>
      {selectedFile && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-200">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded max-w-md">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={onClearFile}
              className="text-gray-500 hover:text-gray-700 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <label
        htmlFor="pdf-upload"
        className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200"
        title="Upload PDF or Image"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm">Upload Image</span>
        <input
          id="pdf-upload"
          type="file"
          accept={VALID_FILE_TYPES.join(",")}
          onChange={onFileChange}
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload PDF or image file"
        />
      </label>
    </>
  );
}
