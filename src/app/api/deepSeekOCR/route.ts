import { NextRequest, NextResponse } from 'next/server';

// Flask backend URL - using ngrok for public access from Google Colab
const BASE_URL = "https://nongilded-rochel-nonspectral.ngrok-free.dev";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('Received request with formData keys:', Array.from(formData.keys()));
    
    // Forward the request to Flask backend /ocr endpoint
    const response = await fetch(`${BASE_URL}/ocr`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    console.log('Flask response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flask error response:', errorText);
      throw new Error(`Flask error! status: ${response.status}, message: ${errorText}`);
    }

    // Flask returns HTML text, not JSON
    const htmlContent = await response.text();
    console.log('Flask response HTML length:', htmlContent.length);
    
    return NextResponse.json({ response: htmlContent });
  } catch (error) {
    console.error('Error proxying chat message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

