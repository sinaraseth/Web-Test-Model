import { handleFileSelection } from './images.services';
import { PromptType } from './prompt.services';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  htmlContent?: string;
  sqlContent?: string;
  modelName?: string;
  prompt?: PromptType;
  file?: {
    name: string;
    type: string;
  };
  imageUrl?: string;
  timestamp: Date;
}

export const processHtmlContent = (html: string, prompt?: PromptType): string => {
  // For "Parse the figure." prompt, return raw HTML without table/markdown processing
  if (prompt === 'Parse the figure.') {
    // Only convert newlines to <br> for plain text, but don't process tables
    if (!html.includes('<table') && !html.includes('<div') && !html.includes('<p>')) {
      return html.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    }
    return html;
  }
  // Convert markdown tables to HTML tables
  const convertMarkdownTable = (text: string): string => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Check for pipe-delimited markdown tables (| col1 | col2 |)
    const hasPipes = lines.some(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    
    if (hasPipes) {
      // Find table start (first line with pipes)
      const tableStartIndex = lines.findIndex(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
      
      if (tableStartIndex >= 0) {
        const beforeTable = lines.slice(0, tableStartIndex).join('<br>');
        const tableLines = lines.slice(tableStartIndex).filter(line => line.trim().startsWith('|'));
        
        // Remove separator line (|---|---|)
        const dataLines = tableLines.filter(line => !line.match(/^\|\s*[-:]+\s*\|/));
        
        if (dataLines.length > 0) {
          const rows = dataLines.map(line => {
            // Remove leading and trailing pipes, then split by pipe
            return line.trim().slice(1, -1).split('|').map(cell => cell.trim());
          });
          
          // Build HTML table
          let tableHtml = "<table style='margin: 1em 0; width: max-content; border-collapse: collapse; border: 1px solid #ddd;'>\n";
          
          // First row is header
          tableHtml += "  <thead><tr>";
          rows[0].forEach(cell => {
            tableHtml += `<th style='text-align: left; padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5;'>${cell}</th>`;
          });
          tableHtml += "</tr></thead>\n";
          
          // Remaining rows are body
          if (rows.length > 1) {
            tableHtml += "  <tbody>\n";
            for (let i = 1; i < rows.length; i++) {
              tableHtml += "    <tr>";
              rows[i].forEach(cell => {
                tableHtml += `<td style='text-align: left; padding: 8px; border: 1px solid #ddd;'>${cell}</td>`;
              });
              tableHtml += "</tr>\n";
            }
            tableHtml += "  </tbody>\n";
          }
          tableHtml += "</table>";
          
          return (beforeTable ? beforeTable + '<br><br>' : '') + tableHtml;
        }
      }
    }
    
    // Check for tab-separated or space-separated tables
    const hasTabs = lines.some(line => line.includes('\t'));
    const hasMultipleSpaces = lines.some(line => /\s{2,}/.test(line));
    
    if (lines.length >= 2 && (hasTabs || hasMultipleSpaces)) {
      // Find table content (skip markdown headers ##)
      const tableStartIndex = lines.findIndex(line => !line.trim().startsWith('#') && (line.includes('\t') || /\s{2,}/.test(line)));
      
      if (tableStartIndex >= 0) {
        const beforeTable = lines.slice(0, tableStartIndex).join('<br>');
        const tableLines = lines.slice(tableStartIndex);
        
        // Split by tabs or multiple spaces
        const separator = hasTabs ? '\t' : /\s{2,}/;
        const rows = tableLines.map(line => line.split(separator).map(cell => cell.trim()));
        
        // Build HTML table
        let tableHtml = "<table style='margin: 1em 0; width: max-content; border-collapse: collapse; border: 1px solid #ddd;'>\n";
        
        if (rows.length > 0) {
          // First row is header
          tableHtml += "  <thead><tr>";
          rows[0].forEach(cell => {
            tableHtml += `<th style='text-align: left; padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5;'>${cell}</th>`;
          });
          tableHtml += "</tr></thead>\n";
          
          // Remaining rows are body
          if (rows.length > 1) {
            tableHtml += "  <tbody>\n";
            for (let i = 1; i < rows.length; i++) {
              tableHtml += "    <tr>";
              rows[i].forEach(cell => {
                tableHtml += `<td style='text-align: left; padding: 8px; border: 1px solid #ddd;'>${cell}</td>`;
              });
              tableHtml += "</tr>\n";
            }
            tableHtml += "  </tbody>\n";
          }
        }
        tableHtml += "</table>";
        
        return (beforeTable ? beforeTable + '<br><br>' : '') + tableHtml;
      }
    }
    
    return text;
  };
  
  // If content contains HTML tables, handle mixed text+HTML content
  if (html.includes('<table')) {
    // Split by table tags to separate text from HTML
    const parts = html.split(/(<table[\s\S]*?<\/table>)/g);
    return parts.map(part => {
      // If part is a table, enhance its styling
      if (part.trim().startsWith('<table')) {
        // Add proper border styling to table
        let styledTable = part;
        
        // Fix table tag - ensure it has proper border styling
        if (!styledTable.match(/<table[^>]*border/)) {
          styledTable = styledTable.replace(
            /<table([^>]*)>/,
            (match, attrs) => {
              const hasStyle = attrs.includes('style=');
              if (hasStyle) {
                return match.replace(/style='([^']*)'/, "style='$1 border-collapse: collapse; border: 1px solid #ddd;'");
              } else {
                return `<table${attrs} style='border-collapse: collapse; border: 1px solid #ddd;'>`;
              }
            }
          );
        }
        
        // Fix th tags - merge styles
        styledTable = styledTable.replace(
          /<th([^>]*)>/g,
          (match, attrs) => {
            const styleMatch = attrs.match(/style='([^']*)'/);
            if (styleMatch) {
              const existingStyles = styleMatch[1];
              const newAttrs = attrs.replace(/style='[^']*'/, `style='${existingStyles} padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5;'`);
              return `<th${newAttrs}>`;
            } else {
              return `<th${attrs} style='padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5;'>`;
            }
          }
        );
        
        // Fix td tags - merge style
        styledTable = styledTable.replace(
          /<td([^>]*)>/g,
          (match, attrs) => {
            const styleMatch = attrs.match(/style='([^']*)'/);
            if (styleMatch) {
              const existingStyles = styleMatch[1];
              const newAttrs = attrs.replace(/style='[^']*'/, `style='${existingStyles} padding: 8px; border: 1px solid #ddd;'`);
              return `<td${newAttrs}>`;
            } else {
              return `<td${attrs} style='padding: 8px; border: 1px solid #ddd;'>`;
            }
          }
        );
        
        return styledTable;
      }
      // Otherwise, convert newlines to <br> for plain text parts
      return part.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    }).join('');
  }
  
  // Try to convert markdown tables to HTML
  const converted = convertMarkdownTable(html);
  if (converted !== html) {
    return converted;
  }
  
  // If content contains other HTML tags, return as-is
  if (html.includes('<div') || html.includes('<p>')) {
    return html;
  }
  
  // Otherwise, convert newlines to <br> for plain text
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
    prompt,
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
    throw new Error('Qwen3VL model is not available yet. Please select DeepSeek OCR or Paddle OCR instead.');
  }

  try {
    // Call Next.js API route
    const formData = new FormData();
    formData.append('prompt', `<image>\n${selectedPrompt}`);
    formData.append('image', selectedFile);
    formData.append('output', 'html'); 

    //Select API endpoint based on model
    let apiEndpoint: string = '/api/deepSeek_ocr_3B';
    if (selectedModel === 'Hybrid (Paddle OCR + Qwen3VL)') {
      apiEndpoint = '/api/paddle_ocr_1B';
    } else if (selectedModel === 'DeepSeek OCR') {
      apiEndpoint = '/api/deepSeek_ocr_3B';
    } else if (selectedModel === 'Qwen3VL') {
      apiEndpoint = '/api/qwen3VL';
    } else if (selectedModel === 'Gemma3') {
      apiEndpoint = '/api/gemma_3_4B';
    } else if (selectedModel === 'Hybrid (DeepSeek OCR + Gemma3)') {
      apiEndpoint = '/api/hybrid-model/deepseek-x-gemma';
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response from backend
      const errorMessage = data.error || 'Request failed';
      const errorDetails = data.details ? `: ${data.details}` : '';
      throw new Error(`${errorMessage}${errorDetails}`);
    }

    // Extract content from response based on type
    let htmlContent = undefined;
    let sqlContent = undefined;

    // Handle new format with type field
    if (data.type === 'html' && data.html) {
      htmlContent = data.html;
      // Check if SQL is also provided (Paddle OCR includes both)
      if (data.sql) {
        sqlContent = data.sql;
      }
    } else {
      // Handle legacy format
      htmlContent = data.response;
      
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
    }

    // Strip markdown code fences if model returned HTML wrapped in ```html
    if (htmlContent && typeof htmlContent === 'string') {
      // Check for ```html ... ``` pattern
      const htmlCodeFenceMatch = htmlContent.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlCodeFenceMatch) {
        htmlContent = htmlCodeFenceMatch[1].trim();
      } else {
        // Check for generic ``` ... ``` pattern with HTML content
        const genericCodeFenceMatch = htmlContent.match(/```\s*(<!DOCTYPE html[\s\S]*?<\/html>)\s*```/i);
        if (genericCodeFenceMatch) {
          htmlContent = genericCodeFenceMatch[1].trim();
        }
      }
    }

    // Only request SQL separately if not already provided (for models other than Paddle OCR)
    if (htmlContent && htmlContent.includes('<table') && !sqlContent) {
      try {
        const sqlFormData = new FormData();
        sqlFormData.append('prompt', `<image>\n${selectedPrompt}`);
        sqlFormData.append('image', selectedFile);
        sqlFormData.append('output', 'sql'); // Request SQL format
        
        const sqlResponse = await fetch(apiEndpoint, {
          method: 'POST',
          body: sqlFormData,
        });

        if (sqlResponse.ok) {
          const sqlData = await sqlResponse.json();
          if (sqlData.type === 'sql' && sqlData.sql) {
            sqlContent = sqlData.sql;
          }
        }
      } catch (sqlError) {
        // Silently fail if SQL request fails, we still have HTML
        console.warn('Failed to fetch SQL format:', sqlError);
      }
    }

    return {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      htmlContent,
      sqlContent,
      timestamp: new Date(),
    };
  } catch (error) {
    throw error;
  }
};