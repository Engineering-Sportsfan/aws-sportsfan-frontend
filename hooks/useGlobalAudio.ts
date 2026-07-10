// hooks/useGlobalAudio.ts
import { useEffect, useState } from 'react';

class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private listeners: Set<(audio: HTMLAudioElement | null) => void> = new Set();

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(audio: HTMLAudioElement, onPlay?: () => void, onPause?: () => void) {
    // Stop current audio if playing
    if (this.currentAudio && this.currentAudio !== audio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    this.currentAudio = audio;
    this.notifyListeners();

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (onPlay) onPlay();
        })
        .catch(error => {
          console.error("Playback failed:", error);
          if (onPause) onPause();
        });
    }

    audio.onended = () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null;
        this.notifyListeners();
        if (onPause) onPause();
      }
    };
  }

  pause(audio: HTMLAudioElement, onPause?: () => void) {
    if (this.currentAudio === audio) {
      audio.pause();
      this.currentAudio = null;
      this.notifyListeners();
      if (onPause) onPause();
    }
  }

  getCurrentAudio() {
    return this.currentAudio;
  }

  subscribe(listener: (audio: HTMLAudioElement | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentAudio));
  }
}

export function useGlobalAudio() {
  const audioManager = AudioManager.getInstance();
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(setCurrentAudio);
    // Return a cleanup function that doesn't return anything
    return () => {
      unsubscribe();
    };
  }, [audioManager]);

  return { audioManager, currentAudio };
}