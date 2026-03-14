
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuestionData, ReplicaData } from "../types";

const API_KEY = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;

const ttsCache = new Map<string, string>();

export interface PosterBlueprint {
  posterTitle: string;
  background: { color: string; texture?: string; };
  layers: Layer[];
}

export interface Layer {
  id: string;
  type: 'image' | 'text' | 'shape';
  content?: string;
  placeholder?: string;
  x: number;
  y: number;
  scale?: number;
  zIndex: number;
  font?: string;
  color?: string;
  size?: number;
  opacity?: number;
  width?: number;
  height?: number;
}

export interface PersonInfo {
  name: string;
  designation: string;
}

export async function processQuestionImage(imageBase64: string): Promise<QuestionData> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
  const textPart = {
    text: `Analyze this image of a multiple-choice question. Return a JSON object with:
      1. "question": The question text.
      2. "options": Array of objects with "letter" (A, B, C, D) and "text".
      3. "correctOption": The letter of the correct answer.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [textPart, imagePart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { letter: { type: Type.STRING }, text: { type: Type.STRING } },
              required: ['letter', 'text'],
            },
          },
          correctOption: { type: Type.STRING },
        },
        required: ['question', 'options', 'correctOption'],
      },
    },
  });

  try {
    return JSON.parse(response.text || "") as QuestionData;
  } catch (e) {
    throw new Error("The AI response was not in the expected format.");
  }
}

export async function restructureText(text: string, instruction: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Rewrite the following text based on this instruction: "${instruction}". Text: "${text}". RETURN ONLY THE REWRITTEN TEXT.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text?.trim() || text;
}

/**
 * High-quality Text to Speech with optional Voice Cloning and Background Atmosphere.
 */
export async function textToSpeech(
  text: string, 
  language?: string, 
  tone?: string, 
  voiceName?: string,
  referenceAudioBase64?: string,
  ambienceMood?: string
): Promise<string> {
    const cacheKey = `${language}-${tone}-${voiceName}-${referenceAudioBase64 ? 'cloned' : 'preset'}-${ambienceMood || 'dry'}-${text}`;
    if (ttsCache.has(cacheKey)) return ttsCache.get(cacheKey)!;

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    let speechInstruction = referenceAudioBase64 
        ? "Speak this text using the EXACT voice, accent, and tone of the provided audio sample."
        : "Speak this text naturally and clearly";

    if (language === 'Marathi') speechInstruction += `. Output should be in natural Marathi.`;
    else if (language === 'Hindi') speechInstruction += `. Output should be in standard Hindi.`;

    if (tone && !referenceAudioBase64) speechInstruction += `, using a ${tone.toLowerCase()} tone`;
    
    // Add Ambience Instruction for the Neural Audio generation
    if (ambienceMood && ambienceMood !== 'none') {
        speechInstruction += `. INTEGRATE a beautiful, subtle ${ambienceMood} background atmosphere into the generated audio. The voice should be clearly audible over the ambient sounds.`;
    }

    const parts: any[] = [{ text: `${speechInstruction}:\n\n${text}` }];
    
    if (referenceAudioBase64) {
        parts.unshift({
            inlineData: {
                mimeType: 'audio/mpeg',
                data: referenceAudioBase64
            }
        });
    }

    const config: any = {
        responseModalities: [Modality.AUDIO]
    };

    if (!referenceAudioBase64) {
        config.speechConfig = {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: (voiceName as any) || 'Charon' },
            },
        };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts }],
        config: config,
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed.");

    ttsCache.set(cacheKey, base64Audio);
    return base64Audio;
}

export async function generateImageFrame(prompt: string, style: string, previousFrameBase64?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const textPart = { text: `Art Style: ${style}. Frame Description: ${prompt}` };
  const contents = previousFrameBase64 
    ? { parts: [{ inlineData: { mimeType: 'image/jpeg', data: previousFrameBase64 } }, textPart] }
    : { parts: [textPart] };
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: contents,
  });
  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (imagePart?.inlineData?.data) return imagePart.inlineData.data;
  throw new Error("The AI failed to generate an image frame.");
}

/**
 * Image Editing for Bulk Editor Tool
 */
export async function editImage(imageBase64: string, prompt: string, model: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'): Promise<string> {
  // IMPORTANT: For gemini-3-pro-image-preview, the API key might be different if user selected it via aistudio
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const contents = {
    parts: [
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: prompt }
    ]
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
  });

  // Find the image part in the response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
      }
  }

  throw new Error("No image data returned from the model.");
}

export async function generatePosterBlueprint(
  mainCandidate: PersonInfo,
  secondaryPeople: PersonInfo[],
  partyName: string,
  logoCount: number,
  language: string,
  theme: string
): Promise<PosterBlueprint> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const systemInstruction = `Role: Political Design Expert. Target: 1080x1350 Canvas. Return JSON with 'layers'.`;
  const peopleList = [mainCandidate, ...secondaryPeople].map((p, i) => `Person ${i+1}: ${p.name}, ${p.designation}`).join('\n');
  const prompt = `Generate a design blueprint in ${language} for: ${peopleList}, Party: ${partyName}, Theme: ${theme}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction, responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
}

/**
 * Analyzes a math document and returns structured layout layers (text, math latex, shapes)
 */
export async function replicateMathDocument(imageBase64: string): Promise<ReplicaData> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    Role: Expert Optical Character Recognition (OCR) and Document Layout Analyst for Mathematical texts.
    Task: Analyze the provided image of a math worksheet/page. 
    Goal: Deconstruct the image into a JSON structure of editable elements.
    
    Requirements:
    1. Identify all text blocks. Return as 'text' type.
    2. Identify all mathematical expressions. Return as 'math' type. CRITICAL: Convert formulas to valid LaTeX (e.g., \\frac{a}{b}).
    3. Identify structural shapes (headers, box borders). Return as 'shape' type.
    4. Provide x, y, width, height as PERCENTAGES (0-100) relative to the image size.
    5. Estimate approximate fontSize relative to standard page.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: "Generate the layout replication JSON." }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aspectRatio: { type: Type.NUMBER, description: "Width divided by height of original image" },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['text', 'math', 'shape'] },
                content: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                fontSize: { type: Type.NUMBER },
                color: { type: Type.STRING },
                bgColor: { type: Type.STRING }
              },
              required: ['id', 'type', 'content', 'x', 'y', 'width', 'height']
            }
          }
        },
        required: ['aspectRatio', 'elements']
      }
    }
  });

  try {
    return JSON.parse(response.text || "") as ReplicaData;
  } catch (e) {
    throw new Error("Failed to parse document layout.");
  }
}

export interface VideoScene {
  id: string;
  duration: number; // in seconds
  narration: string;
  imagePrompt: string;
}

export interface VideoScript {
  title: string;
  type: string;
  totalDuration: number;
  scenes: VideoScene[];
}

export async function generateVideoScript(title: string, description: string, type: 'SHORT' | 'LONG'): Promise<VideoScript> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    Role: Expert Video Producer and AI Prompter.
    Task: Create a full storyboard and script for an animated video.
    
    Requirements:
    1. The script should be tailored to the format: ${type === 'SHORT' ? 'Short-form (e.g. YouTube Shorts, Reels), high pacing, ~30-60 secs.' : 'Long-form (e.g. YouTube), medium pacing, detailed narrative.'}
    2. Divide the script into scenes. Return a JSON object matching the requested schema.
    3. Each scene must have:
       - duration: Estimated time in seconds.
       - narration: Voiceover text (script to be spoken). Must be engaging, emotional, and fit the pacing.
       - imagePrompt: A very detailed text-to-image prompt (style, subject, lighting, action) to generate the visual for the scene.
    4. Provide totalDuration in seconds.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: `Title: ${title}\nDescription: ${description}\nFormat: ${type}\nGenerate the full animated video script and storyboard.` }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          totalDuration: { type: Type.NUMBER },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                narration: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ['id', 'duration', 'narration', 'imagePrompt']
            }
          }
        },
        required: ['title', 'type', 'totalDuration', 'scenes']
      }
    }
  });

  try {
    return JSON.parse(response.text || "") as VideoScript;
  } catch (e) {
    throw new Error("Failed to parse video script.");
  }
}
