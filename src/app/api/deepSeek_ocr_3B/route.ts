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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Flask error response:', data);
      return NextResponse.json(
        { 
          error: data.error || 'Request failed',
          details: data.details 
        },
        { status: response.status }
      );
    }

    console.log('Flask response data:', data);
    
    // Return the data as-is (preserves type, html, sql fields)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying chat message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

