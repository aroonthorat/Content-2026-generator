
import { GoogleGenAI } from "@google/genai";

export interface VideoScene {
  visual_prompt: string;
  audio_prompt: string;
  transition_note: string;
}

const DIRECTOR_PROMPT = `You are an expert AI Video Director.
Create a 30-second video plan (4 scenes). Return ONLY JSON.
Each object: "visual_prompt" (detailed), "audio_prompt", "transition_note".`;

/**
 * Creates a cinematic script for video generation.
 */
export async function generateVideoScript(topic: string): Promise<VideoScene[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Topic: ${topic}`,
    config: {
      systemInstruction: DIRECTOR_PROMPT,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    throw new Error("Failed to script the video.");
  }
}

/**
 * Generates a video using Veo 3.1 Fast.
 */
export async function generateVeoVideo(prompt: string, onProgress?: (msg: string) => void): Promise<string> {
  // Re-instantiate to capture any key updates from user dialogs
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onProgress?.("Contacting Veo 3.1 Studio...");
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  const loadingSteps = [
    "Setting the scene...",
    "Lighting the set...",
    "Rolling cameras...",
    "Rendering textures...",
    "Post-production polishing..."
  ];

  let step = 0;
  while (!operation.done) {
    onProgress?.(loadingSteps[step % loadingSteps.length]);
    step++;
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (err: any) {
        if (err.message?.includes("not found")) throw new Error("API_KEY_EXPIRED");
        throw err;
    }
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  // Requirement: Append key to the URI for downloading bytes
  return `${downloadLink}&key=${process.env.API_KEY}`;
}
