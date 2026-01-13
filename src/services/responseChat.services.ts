import { handleFileSelection } from './images.services';
import { PromptType } from './prompt.services';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  htmlContent?: string;
  file?: {
    name: string;
    type: string;
  };
  imageUrl?: string;
  timestamp: Date;
}

export const processHtmlContent = (html: string): string => {
  return html.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
};

export const validateAndSelectFile = (file: File | undefined): File | null => {
  if (!file) return null;
  
  try {
    return handleFileSelection(file);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invalid file type');
  }
};

export const createUserMessage = (
  prompt: PromptType,
  file: File,
  imageUrl?: string
): Message => {
  return {
    id: Date.now().toString(),
    type: 'user',
    content: prompt,
    file: {
      name: file.name,
      type: file.type,
    },
    imageUrl,
    timestamp: new Date(),
  };
};

export const createErrorMessage = (errorText: string): Message => {
  return {
    id: Date.now().toString(),
    type: 'assistant',
    content: errorText,
    timestamp: new Date(),
  };
};

export const submitChatMessage = async (
  selectedModel: string,
  selectedPrompt: PromptType,
  selectedFile: File
): Promise<Message> => {
  // Check if Qwen3VL is selected
  if (selectedModel === 'Qwen3VL') {
    throw new Error('Qwen3VL model is not available yet. Please select DeepSeek OCR instead.');
  }

  try {
    // Call Next.js API route (which proxies to Flask)
    const formData = new FormData();
    formData.append('prompt', `<image>\n${selectedPrompt}`);
    formData.append('image', selectedFile);

    // Select API endpoint based on model
    const apiEndpoint = selectedModel === 'DeepSeek OCR' ? '/api/deepSeekOCR' : '/api/qwen3VL';
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract HTML content from response
    let htmlContent = data.response;
    
    // If response contains {"html":"..."}, extract just the HTML
    if (typeof htmlContent === 'string' && htmlContent.includes('{"html":"')) {
      try {
        const parsed = JSON.parse(htmlContent);
        htmlContent = parsed.html;
      } catch {
        // If parsing fails, try regex extraction
        const match = htmlContent.match(/\{"html":"(.*)"\}/);
        if (match) {
          htmlContent = match[1];
        }
      }
    }

    return {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      htmlContent: htmlContent,
      timestamp: new Date(),
    };
  } catch (error) {
    throw error;
  }
};