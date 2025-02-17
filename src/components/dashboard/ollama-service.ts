// ollama-service.ts

/** 
 * Ollama's /generate response structure can be streamed or chunked.
 * For a single JSON response, it typically includes a `completion` field. 
 */
interface OllamaGenerateResponse {
    completion?: string;
    // You may see other fields like "model", "done", etc.
    // done?: boolean;
    // model?: string;
  }
  
  /**
   * Calls Ollama's /generate endpoint (via our Vite proxy).
   * @param prompt The text prompt for Ollama.
   * @returns The completion string from Ollama (or empty string if none).
   */
  export async function askOllama(prompt: string): Promise<string> {
    const response = await fetch("/api/ollama/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to call Ollama: " + response.statusText);
    }
  
    // For a single-shot completion, Ollama might return an object with { completion: "..."}
    const data = (await response.json()) as OllamaGenerateResponse;
    return data.completion ?? "";
  }
  