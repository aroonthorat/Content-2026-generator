
import React, { useState, useRef, useCallback, useEffect } from 'react';

export const useScreenRecorder = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalRecording, setFinalRecording] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (!isEnabled) return;
    setError(null);
    setFinalRecording(null);
    chunksRef.current = [];

    try {
      // Use standard display media API
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
            displaySurface: 'browser',
        } as any,
        audio: true // Request audio capture (system/tab audio)
      });

      // Check mime type support for best compatibility
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setFinalRecording(blob);
        setIsFinalizing(false);
        setIsActive(false);
        
        // Stop all tracks to release hardware resources
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsActive(true);

      // Handle user clicking "Stop sharing" in the browser UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        };
      }

    } catch (err: any) {
      console.error("Error starting screen recording:", err);
      // NotAllowedError happens when user cancels the picker
      if (err.name === 'NotAllowedError') {
         setIsEnabled(false);
      } else {
         setError(err.message || "Failed to start recording");
      }
      setIsActive(false);
    }
  }, [isEnabled]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsFinalizing(true);
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setFinalRecording(null);
    setError(null);
    setIsActive(false);
    setIsFinalizing(false);
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isEnabled,
    setIsEnabled,
    isActive,
    isFinalizing,
    finalRecording,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
};
