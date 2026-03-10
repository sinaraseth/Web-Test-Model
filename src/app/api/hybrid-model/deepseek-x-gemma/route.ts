import { NextRequest, NextResponse } from "next/server";
import http from "http";

// Ollama local instance
const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEEPSEEK_MODEL = "deepseek-ocr:3b";
const GEMMA_MODEL = "gemma3:4b";

async function fetchWithLongTimeout(url: string, options: any) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(options.body);

    const req = http.request(
      url,
      {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
        timeout: 900000, // 15 minutes
      },
      (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          resolve({
            ok: res.statusCode === 200,
            status: res.statusCode,
            text: async () => responseData,
            json: async () => JSON.parse(responseData),
          });
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(data);
    req.end();
  });
}

async function callOllamaModel(
  model: string,
  prompt: string,
  base64Image: string,
) {
  const payload = {
    model: model,
    prompt: prompt,
    images: [base64Image],
    stream: false,
  };

  const response: any = await fetchWithLongTimeout(OLLAMA_URL, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${model} request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.response || "";
}

async function callOllamaTextOnly(model: string, prompt: string) {
  const payload = {
    model: model,
    prompt: prompt,
    stream: false,
  };

  const response: any = await fetchWithLongTimeout(OLLAMA_URL, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${model} request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.response || "";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    console.log(
      "Hybrid model - Received request with formData keys:",
      Array.from(formData.keys()),
    );

    // Extract image and prompt from formData
    const imageFile = formData.get("image") as File;
    const userPrompt = formData.get("prompt") as string;
    const outputFormat = (formData.get("output") as string) || "html";

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    console.log("Step 1 & 2: Running DeepSeek OCR and Gemma3 in parallel...");
    // Step 1 & 2: Run both models in parallel for faster processing
    const [deepseekOutput, gemmaOutput] = await Promise.all([
      callOllamaModel(
        DEEPSEEK_MODEL,
        userPrompt || "Parse the figure.",
        base64Image,
      ),
      callOllamaModel(
        GEMMA_MODEL,
        userPrompt || "Parse the figure.",
        base64Image,
      ),
    ]);

    console.log("Both models completed:");
    console.log("- DeepSeek output:", deepseekOutput.substring(0, 100) + "...");
    console.log("- Gemma3 output:", gemmaOutput.substring(0, 100) + "...");

    console.log("Step 3: Running Gemma3 correction (text-only comparison)...");
    // Step 3: Use Gemma3 to correct and merge both outputs (no image needed, just compare texts)
    const correctionPrompt = `You are given two OCR outputs from different models analyzing the same document image:

**DeepSeek OCR Output:**
${deepseekOutput}

**Gemma3 Output:**
${gemmaOutput}

TASK:
- Compare both outputs and identify the most accurate information from each
- Fix OCR errors, missing text, wrong numbers, and incorrect table structure
- Merge the best parts from both outputs into one corrected version
- Ensure the final HTML accurately represents the document data

RULES:
- Output valid HTML ONLY
- Preserve reading order
- Use semantic HTML (<h1>, <p>, <table>, <tr>, <th>, <td>)
- For tables: Ensure proper structure with headers and data rows
- For graphs/charts: Represent data points as tables
- Do NOT explain changes
- Do NOT include markdown code fences
- Do NOT include comments or descriptions
- Do NOT add text like "Source:", "Note:", or summaries
- Start directly with HTML tags

Output the corrected HTML now:`;

    let correctedOutput = await callOllamaTextOnly(
      GEMMA_MODEL,
      correctionPrompt,
    );

    // Strip any markdown code fences or explanatory text before/after HTML
    if (correctedOutput.includes("```")) {
      const htmlMatch =
        correctedOutput.match(/```html\s*([\s\S]*?)\s*```/) ||
        correctedOutput.match(/```\s*([\s\S]*?)\s*```/);
      if (htmlMatch) {
        correctedOutput = htmlMatch[1].trim();
      }
    }

    // Remove any leading explanatory text before HTML tags
    const htmlStartMatch = correctedOutput.match(
      /(<(?:table|div|h[1-6]|p|ul|ol|section|article)[\s>])/i,
    );
    if (htmlStartMatch && htmlStartMatch.index && htmlStartMatch.index > 0) {
      correctedOutput = correctedOutput.substring(htmlStartMatch.index);
    }

    console.log("Correction completed");

    // Step 4: Generate SQL from corrected HTML if it contains tables
    console.log("Step 4: Checking for tables in corrected output...");
    let sqlOutput = undefined;
    if (
      correctedOutput.includes("<table") ||
      correctedOutput.toLowerCase().includes("table")
    ) {
      console.log("Table detected, generating SQL (text-only conversion)...");
      const sqlPrompt = `Convert the following HTML table to SQL CREATE TABLE and INSERT statements. 
Extract the table structure and data, then generate:
1. A CREATE TABLE statement with appropriate column names and data types (use VARCHAR for text, INT for numbers)
2. INSERT statements for all the data rows

HTML content:
${correctedOutput}

Provide only the SQL code without any explanations, markdown formatting, or code fences. Start with CREATE TABLE and follow with INSERT statements.`;

      sqlOutput = await callOllamaTextOnly(GEMMA_MODEL, sqlPrompt);

      // Strip any markdown code fences from SQL output
      if (sqlOutput.includes("```")) {
        const sqlMatch =
          sqlOutput.match(/```sql\s*([\s\S]*?)\s*```/) ||
          sqlOutput.match(/```\s*([\s\S]*?)\s*```/);
        if (sqlMatch) {
          sqlOutput = sqlMatch[1].trim();
        }
      }

      console.log("SQL generation completed");
    } else {
      console.log("No table detected in corrected output");
    }

    // Return in expected format
    return NextResponse.json({
      type: outputFormat,
      html: correctedOutput,
      sql: sqlOutput,
      response: correctedOutput, // Legacy format support
      metadata: {
        deepseekOutput: deepseekOutput,
        gemmaOutput: gemmaOutput,
        corrected: true,
      },
    });
  } catch (error) {
    console.error("Hybrid model error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        {
          error: "Ollama model not found",
          details:
            "Make sure both deepseek-ocr:3b and gemma3:4b models are available in Ollama",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process hybrid request",
      },
      { status: 500 },
    );
  }
}
