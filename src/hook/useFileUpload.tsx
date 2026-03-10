import { useState, useRef } from "react";
import { validateAndSelectFile } from "../services/responseChat.services";

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      const validatedFile = validateAndSelectFile(file);
      setSelectedFile(validatedFile);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid file type");
    }
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    selectedFile,
    fileInputRef,
    handleFileChange,
    clearFileInput,
  };
}
