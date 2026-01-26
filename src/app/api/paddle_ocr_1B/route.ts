import { NextRequest, NextResponse } from 'next/server';

// Fast backend URL - using ngrok for public access from Google Colab
const BASE_URL = "https://nelia-octachordal-sherril.ngrok-free.dev";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    console.log('Received request with formData keys:', Array.from(formData.keys()));
    
    // Forward the request to Fast backend /markdown/doclayout-extract endpoint
    const response = await fetch(`${BASE_URL}/markdown/doclayout-extract`, {
      method: 'POST',
      body: formData,
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    console.log('Fast response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Fast error response:', data);
      return NextResponse.json(
        { 
          error: data.error || 'Request failed',
          details: data.details 
        },
        { status: response.status }
      );
    }

    console.log('Fast response data:', data);
    
    // Transform Paddle OCR response format to match expected format
    // Paddle returns: { result: [{ markdown: "...", sql: "..." }] }
    // Expected format: { type: "html", html: "...", sql: "..." }
    if (data.result && Array.isArray(data.result) && data.result.length > 0) {
      const firstResult = data.result[0];
      const transformedData = {
        type: 'html',
        html: firstResult.markdown || '',
        sql: firstResult.sql || undefined
      };
      return NextResponse.json(transformedData);
    }
    
    // Return the data as-is if format doesn't match
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying chat message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

