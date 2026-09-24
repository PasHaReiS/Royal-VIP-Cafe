/**
 * Real-time Voice Chat Service
 * Handles browser microphone capture, Web Audio meter analysis,
 * speech synthesis banter responses from Turkish cafe opponents,
 * and audio sound cues.
 */

class VoiceChatService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private isMicActive = false;
  private isDeafened = false;
  private volumeLevel = 0;
  private animationFrameId: number | null = null;
  private listeners: Set<(level: number, isSpeaking: boolean) => void> = new Set();
  private statusListeners: Set<(isMicActive: boolean, isDeafened: boolean) => void> = new Set();

  public subscribe(cb: (level: number, isSpeaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public subscribeStatus(cb: (isMicActive: boolean, isDeafened: boolean) => void): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private notifyStatus() {
    this.statusListeners.forEach((cb) => cb(this.isMicActive, this.isDeafened));
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => (t.enabled = true));
        this.isMicActive = true;
        this.playVoiceBeep(true);
        this.notifyStatus();
        return true;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported in this environment');
        this.isMicActive = true;
        this.startSimulatedMeter();
        this.playVoiceBeep(true);
        this.notifyStatus();
        return true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);

      this.isMicActive = true;
      this.playVoiceBeep(true);
      this.notifyStatus();
      this.startMeterLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access denied or not available, using simulated audio wave meter', err);
      // Fallback: still enable voice chat with simulated wave meter so user can participate
      this.isMicActive = true;
      this.startSimulatedMeter();
      this.playVoiceBeep(true);
      this.notifyStatus();
      return true;
    }
  }

  public stopMicrophone() {
    this.isMicActive = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => (t.enabled = false));
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.volumeLevel = 0;
    this.listeners.forEach((cb) => cb(0, false));
    this.playVoiceBeep(false);
    this.notifyStatus();
  }

  public toggleMicrophone(): boolean {
    if (this.isMicActive) {
      this.stopMicrophone();
      return false;
    } else {
      this.startMicrophone();
      return true;
    }
  }

  public toggleDeafen(): boolean {
    this.isDeafened = !this.isDeafened;
    this.notifyStatus();
    return this.isDeafened;
  }

  public getMicActive(): boolean {
    return this.isMicActive;
  }

  public getDeafened(): boolean {
    return this.isDeafened;
  }

  private startMeterLoop() {
    const update = () => {
      if (!this.isMicActive || !this.analyser || !this.dataArray) {
        return;
      }
      this.analyser.getByteFrequencyData(this.dataArray);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const avg = sum / this.dataArray.length;
      this.volumeLevel = Math.min(100, Math.round((avg / 128) * 100));
      const isSpeaking = this.volumeLevel > 15;

      this.listeners.forEach((cb) => cb(this.volumeLevel, isSpeaking));
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  private startSimulatedMeter() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    let step = 0;
    const sim = () => {
      if (!this.isMicActive) return;
      step++;
      // Subtle natural fluctuation
      const val = Math.max(0, Math.round(20 + Math.sin(step * 0.1) * 15 + (Math.random() * 10 - 5)));
      this.volumeLevel = val;
      const isSpeaking = val > 18;
      this.listeners.forEach((cb) => cb(this.volumeLevel, isSpeaking));
      this.animationFrameId = requestAnimationFrame(sim);
    };
    sim();
  }

  /**
   * Sound effect for muting/unmuting mic
   */
  private playVoiceBeep(isTurnOn: boolean) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = this.audioContext || new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isTurnOn ? 660 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isTurnOn ? 880 : 330, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * Turkish vocal opponent speech reaction
   */
  public speakOpponentRemark(speakerName: string, text: string) {
    if (this.isDeafened) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05;
      utterance.pitch = speakerName.includes('Haydar') ? 0.85 : speakerName.includes('Murat') ? 0.95 : 1.0;

      // Select Turkish voice if available
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find((v) => v.lang.startsWith('tr'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  }
}

export const voiceChatService = new VoiceChatService();
