"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const AR_FILLERS = ["آه", "أممم", "يعني", "كده", "بصراحة", "اممم", "اهه", "والله"];
const EN_FILLERS = ["um", "uh", "er", "like", "basically", "you know", "sort of", "kind of"];

export type SpeechMeta = {
  confidence: number;   // 0-100 from browser API
  fillerCount: number;
  wordCount: number;
  durationMs: number;
  wpm: number;
};

export type UseSpeechRecognitionReturn = {
  isListening: boolean;
  interimText: string;
  supported: boolean;
  startListening: () => void;
  stopListening: () => void;
  lastMeta: SpeechMeta | null;
};

export function useSpeechRecognition(
  lang: "ar" | "en",
  onFinalResult: (transcript: string, meta: SpeechMeta) => void
): UseSpeechRecognitionReturn {
  const [isListening,  setIsListening]  = useState(false);
  const [interimText,  setInterimText]  = useState("");
  const [supported,    setSupported]    = useState(false);
  const [lastMeta,     setLastMeta]     = useState<SpeechMeta | null>(null);

  const recognitionRef = useRef<any>(null);
  const startTimeRef   = useRef<number>(0);
  const confidencesRef = useRef<number[]>([]);
  const silenceTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);

    const r = new SR();
    r.lang             = lang === "ar" ? "ar-KW" : "en-US";
    r.continuous       = true;
    r.interimResults   = true;
    r.maxAlternatives  = 1;

    let finalTranscript = "";

    r.onstart = () => {
      startTimeRef.current   = Date.now();
      confidencesRef.current = [];
      finalTranscript        = "";
      setInterimText("");
      setIsListening(true);
    };

    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
          confidencesRef.current.push(result[0].confidence ?? 0.5);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(finalTranscript + interim);

      // Reset silence timer — auto-stop after 2.5s of silence
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => r.stop(), 2500);
    };

    r.onerror = () => { setIsListening(false); setInterimText(""); };

    r.onend = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      setIsListening(false);
      setInterimText("");

      const text = finalTranscript.trim();
      if (!text) return;

      const durationMs  = Date.now() - startTimeRef.current;
      const avgConf     = confidencesRef.current.length
        ? confidencesRef.current.reduce((a, b) => a + b, 0) / confidencesRef.current.length
        : 0.5;
      const words       = text.split(/\s+/).filter(Boolean);
      const fillers     = lang === "ar" ? AR_FILLERS : EN_FILLERS;
      const fillerCount = words.filter((w) => fillers.includes(w.toLowerCase().replace(/[.,!?]/g, ""))).length;
      const wpm         = Math.round((words.length / (durationMs / 1000)) * 60);

      const meta: SpeechMeta = {
        confidence:  Math.round(avgConf * 100),
        fillerCount,
        wordCount:   words.length,
        durationMs,
        wpm,
      };
      setLastMeta(meta);
      onFinalResult(text, meta);
    };

    recognitionRef.current = r;
    return () => { r.abort(); };
  }, [lang, onFinalResult]);

  const startListening = useCallback(() => {
    recognitionRef.current?.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, interimText, supported, startListening, stopListening, lastMeta };
}
