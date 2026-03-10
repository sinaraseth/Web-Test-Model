export const VALID_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type ValidFileType = (typeof VALID_FILE_TYPES)[number];

export const validateFileType = (file: File): boolean => {
  return VALID_FILE_TYPES.includes(file.type as ValidFileType);
};

export const handleFileSelection = (file: File | undefined): File | null => {
  if (!file) return null;

  if (validateFileType(file)) {
    return file;
  } else {
    throw new Error("Please select a PDF or image file (JPEG, PNG, GIF, WebP)");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
};
