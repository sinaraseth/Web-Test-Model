import { NextRequest, NextResponse } from 'next/server';

// Ollama instance - uses environment variable or defaults to localhost
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_API_URL = `${OLLAMA_URL}/api/generate`;
const MODEL_NAME = "gemma3:4b";

async function callOllamaTextOnly(model: string, prompt: string) {
  const payload = {
    model: model,
    prompt: prompt,
    stream: false
  };

  const response = await fetch(OLLAMA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${model} request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.response || '';
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

    // Enhance prompt to ensure HTML output
    const basePrompt = prompt || "Parse the figure.";
    const actualPrompt = `${basePrompt}

IMPORTANT: If the image contains a table or structured data, output it in proper HTML format using <table>, <tr>, <th>, and <td> tags. Do not use markdown. Provide only the HTML output without explanations or code fences.`;

    // Prepare payload for Ollama
    const payload = {
      model: MODEL_NAME,
      prompt: actualPrompt,
      images: [base64Image],
      stream: false
    };

    console.log('Sending request to Ollama with prompt:', actualPrompt);
    console.log('Using model:', MODEL_NAME);
    console.log('Image size:', base64Image.length, 'characters');

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
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
    let modelResponse = data.response || '';

    // Strip markdown code fences if model returned HTML wrapped in ```html
    if (modelResponse.includes('```')) {
      const htmlCodeFenceMatch = modelResponse.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlCodeFenceMatch) {
        modelResponse = htmlCodeFenceMatch[1].trim();
      } else {
        // Check for generic ``` ... ``` pattern with HTML content
        const genericCodeFenceMatch = modelResponse.match(/```\s*(<!DOCTYPE html[\s\S]*?<\/html>|<table[\s\S]*?<\/table>)\s*```/i);
        if (genericCodeFenceMatch) {
          modelResponse = genericCodeFenceMatch[1].trim();
        }
      }
    }

    // Generate SQL from HTML if it contains tables
    let sqlOutput = undefined;
    if (modelResponse && (modelResponse.includes('<table') || modelResponse.toLowerCase().includes('table'))) {
      console.log('Table detected, generating SQL (text-only)...');
      try {
        const sqlPrompt = `Convert the following HTML table to SQL CREATE TABLE and INSERT statements. 
Extract the table structure and data, then generate:
1. A CREATE TABLE statement with appropriate column names and data types (use VARCHAR for text, INT for numbers)
2. INSERT statements for all the data rows

HTML content:
${modelResponse}

Provide only the SQL code without any explanations, markdown formatting, or code fences. Start with CREATE TABLE and follow with INSERT statements.`;

        sqlOutput = await callOllamaTextOnly(MODEL_NAME, sqlPrompt);
        
        // Strip any markdown code fences from SQL output
        if (sqlOutput.includes('```')) {
          const sqlMatch = sqlOutput.match(/```sql\s*([\s\S]*?)\s*```/) || sqlOutput.match(/```\s*([\s\S]*?)\s*```/);
          if (sqlMatch) {
            sqlOutput = sqlMatch[1].trim();
          }
        }
        
        console.log('SQL generation completed');
      } catch (sqlError) {
        console.warn('Failed to generate SQL:', sqlError);
        // Continue without SQL if generation fails
      }
    }

    // Return in expected format
    return NextResponse.json({
      type: outputFormat,
      html: modelResponse,
      sql: sqlOutput,
      response: modelResponse, // Legacy format support
    });
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message === 'Request timeout') {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            details: 'Gemma3 model took too long to respond (>15 minutes). Try with a smaller image or use DeepSeek OCR instead.'
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
