// =============================================================================
// src/speech/speech.ts
// Web Speech API wrapper: text-to-speech (SpeechSynthesis) and speech-to-text
// (SpeechRecognition). Feature-detected and defensive — every entry point
// degrades gracefully when the browser lacks support or denies the mic.
//
// Browser notes:
//  - TTS (speechSynthesis) is broadly supported. Voices load asynchronously, so
//    we wait for `voiceschanged` before selecting an Italian voice.
//  - STT (SpeechRecognition) is prefixed as webkitSpeechRecognition in
//    Chromium/Safari and absent in Firefox; callers should check isSttSupported.
// =============================================================================

import { similarity } from "../quiz/text.js";

const IT_LANG = "it-IT";

// ---- Minimal typings for the (still non-standard) SpeechRecognition API -----

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  results: { 0: SpeechRecognitionResultLike; length: number };
}
interface SpeechRecognitionErrorLike {
  error: string;
  message?: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ---- Feature detection ------------------------------------------------------

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSttSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface SpeechSupport {
  tts: boolean;
  stt: boolean;
}
export function speechSupport(): SpeechSupport {
  return { tts: isTtsSupported(), stt: isSttSupported() };
}

// ---- Text-to-speech ---------------------------------------------------------

let cachedVoices: SpeechSynthesisVoice[] | null = null;

/** Resolve the list of available voices, waiting for async load if needed. */
export function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (!isTtsSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };
    synth.addEventListener("voiceschanged", finish, { once: true });
    setTimeout(finish, timeoutMs); // fall back if the event never fires
  });
}

/** Pick the best Italian voice, preferring native it-IT voices. */
export async function pickItalianVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = cachedVoices ?? (await loadVoices());
  const italian = voices.filter((v) => v.lang?.toLowerCase().startsWith("it"));
  if (italian.length === 0) return null;
  return italian.find((v) => v.localService) ?? italian[0]!;
}

export interface SpeakOptions {
  rate?: number; // 0.1..10, default 0.95 (slightly slow for learners)
  pitch?: number; // 0..2
  lang?: string;
}

/**
 * Speak Italian text. Resolves when playback ends, rejects on error or when TTS
 * is unavailable. Cancels any in-flight utterance first.
 */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isTtsSupported()) return Promise.reject(new Error("Text-to-speech is not supported in this browser."));
  const synth = window.speechSynthesis;
  synth.cancel();

  return new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = opts.lang ?? IT_LANG;
    utterance.rate = opts.rate ?? 0.95;
    utterance.pitch = opts.pitch ?? 1;

    pickItalianVoice()
      .then((voice) => {
        if (voice) utterance.voice = voice;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(new Error(`Speech synthesis failed: ${e.error ?? "unknown"}`));
        synth.speak(utterance);
      })
      .catch(reject);
  });
}

/** Stop any current speech immediately. */
export function stopSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

// ---- Speech-to-text ---------------------------------------------------------

export interface ListenResult {
  transcript: string;
  confidence: number;
}

export class SpeechError extends Error {
  constructor(
    message: string,
    public readonly code: "unsupported" | "no-speech" | "not-allowed" | "aborted" | "error",
  ) {
    super(message);
    this.name = "SpeechError";
  }
}

/**
 * Listen for a single Italian utterance and resolve its transcript. Rejects
 * with a typed SpeechError on failure (unsupported, denied mic, no speech…).
 * Returns a `cancel()` alongside the promise so the UI can abort.
 */
export function listenOnce(opts: { lang?: string; timeoutMs?: number } = {}): {
  promise: Promise<ListenResult>;
  cancel: () => void;
} {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    return {
      promise: Promise.reject(new SpeechError("Speech recognition is not supported in this browser.", "unsupported")),
      cancel: () => {},
    };
  }

  const recognition = new Ctor();
  recognition.lang = opts.lang ?? IT_LANG;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  let settled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<ListenResult>((resolve, reject) => {
    recognition.onresult = (event) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      const alt = event.results[0]?.[0];
      resolve({ transcript: alt?.transcript ?? "", confidence: alt?.confidence ?? 0 });
    };
    recognition.onerror = (event) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      const code =
        event.error === "no-speech"
          ? "no-speech"
          : event.error === "not-allowed" || event.error === "service-not-allowed"
            ? "not-allowed"
            : event.error === "aborted"
              ? "aborted"
              : "error";
      reject(new SpeechError(`Speech recognition error: ${event.error}`, code));
    };
    recognition.onend = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      reject(new SpeechError("No speech was detected.", "no-speech"));
    };

    try {
      recognition.start();
    } catch (err) {
      if (!settled) {
        settled = true;
        reject(new SpeechError(`Could not start recognition: ${String(err)}`, "error"));
      }
    }

    const timeoutMs = opts.timeoutMs ?? 8000;
    timer = setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    }, timeoutMs);
  });

  const cancel = () => {
    try {
      recognition.abort();
    } catch {
      /* ignore */
    }
  };

  return { promise, cancel };
}

/**
 * Score a spoken attempt against a target phrase, 0..100.
 * Combines transcript similarity with the recognizer's own confidence so a
 * confident exact match scores near 100 and a poor match scores low.
 */
export function scorePronunciation(target: string, result: ListenResult): number {
  const sim = similarity(target, result.transcript); // 0..100
  // Confidence in [0,1]; when the API reports 0 (common), fall back to pure sim.
  const conf = result.confidence > 0 ? result.confidence : 1;
  return Math.round(sim * (0.7 + 0.3 * conf));
}
