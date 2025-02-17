// web-llm-engine-context.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { CreateMLCEngine, MLCEngineInterface } from "@mlc-ai/web-llm";

type WebLLMContextType = {
  engine?: MLCEngineInterface;
  loading: boolean;
};

const WebLLMContext = createContext<WebLLMContextType>({
  engine: undefined,
  loading: true,
});

export function WebLLMProvider({ children }: { children: React.ReactNode }) {
  const [engine, setEngine] = useState<MLCEngineInterface>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function init() {
      try {
        setLoading(true);
        // Create engine and load a built-in model. 
        // Check https://github.com/mlc-ai/web-llm#built-in-models 
        // for the list of model names.
        const eng = await CreateMLCEngine("DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC", {
          initProgressCallback: (p) => {
            console.log("Load progress:", p);
          },
        });
        if (!canceled) {
          setEngine(eng);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to init WebLLM engine:", err);
        setLoading(false);
      }
    }

    init();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <WebLLMContext.Provider value={{ engine, loading }}>
      {children}
    </WebLLMContext.Provider>
  );
}

export function useWebLLM() {
  return useContext(WebLLMContext);
}
