import { NextRequest, NextResponse } from 'next/server';

// Ollama local instance
const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "deepseek-ocr:3b";

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
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

