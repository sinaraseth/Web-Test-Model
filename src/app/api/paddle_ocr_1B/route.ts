import { NextRequest, NextResponse } from 'next/server';

// Configure route to allow longer execution time
export const maxDuration = 300; // 5 minutes per request
export const dynamic = 'force-dynamic';

// Ollama instance - uses environment variable or defaults to localhost
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_API_URL = `${OLLAMA_URL}/api/generate`;
const MODEL_NAME = "deepseek-ocr:3b";
const TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes
const MAX_RETRIES = 2;

// Fetch with timeout support and retry logic
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeoutMs: number = TIMEOUT_MS,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      console.log(`Attempt ${attempt + 1}/${retries + 1} - Sending request to Ollama...`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log(`Attempt ${attempt + 1} succeeded`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      const isTimeout = lastError.name === 'AbortError' || 
                       lastError.message.includes('timeout') ||
                       lastError.message.includes('HeadersTimeoutError');
      
      if (isTimeout && attempt < retries) {
        console.log(`Attempt ${attempt + 1} timed out, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      if (isTimeout) {
        throw new Error('Request timeout - Ollama took too long to respond');
      }
      throw lastError;
    }
  }
  
  throw lastError || new Error('Request failed');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('Received request with formData keys:', Array.from(formData.keys()));
    
    // Extract image and prompt from formData
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const outputFormat = formData.get('output') as string || 'html';
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Prepare payload for Ollama
    const payload = {
      model: MODEL_NAME,
      prompt: prompt || "Parse the figure.",
      images: [base64Image],
      stream: false
    };

    console.log('Sending request to Ollama with prompt:', prompt);

    // Send request to Ollama
    const response = await fetchWithTimeout(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true',
      },
      body: JSON.stringify(payload),
    });

    console.log('Ollama response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error response:', errorText);
      
      // Check if Ollama is running
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'Ollama server not found',
            details: 'Make sure Ollama is running on http://localhost:11434'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Ollama request failed',
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Ollama response data:', data);

    // Extract response from Ollama format
    const modelResponse = data.response || '';

    // Return in expected format
    return NextResponse.json({
      type: outputFormat,
      html: modelResponse,
      response: modelResponse, // Legacy format support
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

