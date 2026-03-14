
let audioContext: AudioContext | null = null;
const SAMPLE_RATE = 24000;

function getAudioContext(): AudioContext {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.error("Failed to resume AudioContext:", err));
    }
    return audioContext;
}

export const initAudio = () => {
    getAudioContext();
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  if (numChannels === 1) {
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
      }
  } else {
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
  }
  return buffer;
}

/**
 * Plays audio and returns a controller to stop it.
 */
export const playAudio = (base64Audio: string): { stop: () => void, onEnded: Promise<void> } => {
    const ctx = getAudioContext();
    let source: AudioBufferSourceNode | null = null;

    const onEnded = new Promise<void>(async (resolve, reject) => {
        try {
            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, ctx, SAMPLE_RATE, 1);
            
            source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => resolve();
            source.start();
        } catch (error) {
            console.error("Failed to play audio:", error);
            reject(error);
        }
    });

    return {
        stop: () => {
            if (source) {
                try {
                    source.stop();
                } catch (e) {
                    // Source might already be stopped
                }
            }
        },
        onEnded
    };
};

export const playBeep = (duration = 150, frequency = 880, volume = 0.5): Promise<void> => {
    return new Promise((resolve) => {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);

        oscillator.start(ctx.currentTime);

        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration / 1000);
        oscillator.stop(ctx.currentTime + duration / 1000);

        oscillator.onended = () => resolve();
    });
};
