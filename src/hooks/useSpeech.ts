// =============================================================================
// src/hooks/useSpeech.ts
// React bindings for the speech wrapper: exposes support flags, a speak()
// action with speaking state, and a listen() action with listening state and
// typed errors. Cleans up in-flight recognition on unmount.
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listenOnce,
  speak as speakRaw,
  speechSupport,
  stopSpeaking,
  type ListenResult,
  SpeechError,
} from "../speech/speech.js";

export interface UseSpeech {
  support: { tts: boolean; stt: boolean };
  speaking: boolean;
  listening: boolean;
  error: string | null;
  speak: (text: string) => Promise<void>;
  listen: () => Promise<ListenResult | null>;
  cancelListen: () => void;
}

export function useSpeech(): UseSpeech {
  const support = useMemo(() => speechSupport(), []);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelRef.current?.();
      stopSpeaking();
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    setError(null);
    setSpeaking(true);
    try {
      await speakRaw(text);
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (mounted.current) setSpeaking(false);
    }
  }, []);

  const listen = useCallback(async (): Promise<ListenResult | null> => {
    setError(null);
    setListening(true);
    const { promise, cancel } = listenOnce();
    cancelRef.current = cancel;
    try {
      const result = await promise;
      return result;
    } catch (err) {
      if (mounted.current) {
        const msg =
          err instanceof SpeechError && err.code === "not-allowed"
            ? "Microphone access was blocked. Enable it to practise pronunciation."
            : err instanceof SpeechError && err.code === "no-speech"
              ? "Didn't catch that — try speaking again."
              : err instanceof Error
                ? err.message
                : String(err);
        setError(msg);
      }
      return null;
    } finally {
      cancelRef.current = null;
      if (mounted.current) setListening(false);
    }
  }, []);

  const cancelListen = useCallback(() => {
    cancelRef.current?.();
  }, []);

  return { support, speaking, listening, error, speak, listen, cancelListen };
}
