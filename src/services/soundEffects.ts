/**
 * Royal VIP Cafe - Web Audio Sound Synthesizer
 * High-fidelity, zero-dependency procedural audio engine for authentic cafe ambiance,
 * dice rolls, wooden backgammon clacks, Okey tile taps, and tea service chimes.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public ambientMusicEnabled: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Master mute toggle
  public toggleSound(force?: boolean) {
    this.enabled = force !== undefined ? force : !this.enabled;
    if (!this.enabled && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  // Authentic Dice Roll Sound (Board rail collision + wooden surface tumbling)
  public playDiceRoll() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Initial Sharp Wood Rail Collision ("Tak!" - die slamming into wooden outer rail)
    const railClack = (time: number, freq: number, gainVal: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(115, now + time + 0.055);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now + time);
      filter.Q.setValueAtTime(3.0, now + time);

      gain.gain.setValueAtTime(gainVal, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.065);
    };

    // Die 1 slams into right outer rail at ~0.22s
    railClack(0.22, 440, 0.48);
    // Die 2 slams into center wooden bar rail at ~0.48s
    railClack(0.48, 380, 0.42);

    // 2. Secondary tumbling and ricochet bounces across walnut wood surface
    const bounces = [
      { t: 0.70, f: 310, g: 0.35 },
      { t: 0.82, f: 280, g: 0.28 },
      { t: 0.96, f: 250, g: 0.22 },
      { t: 1.08, f: 220, g: 0.16 },
      { t: 1.20, f: 200, g: 0.10 },
      { t: 1.28, f: 180, g: 0.06 },
    ];

    for (const b of bounces) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(b.f, now + b.t);
      osc.frequency.exponentialRampToValueAtTime(80, now + b.t + 0.045);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + b.t);

      gain.gain.setValueAtTime(b.g, now + b.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + b.t + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + b.t);
      osc.stop(now + b.t + 0.055);
    }
  }

  // Subtle click when picking/touching a checker
  public playCheckerSelect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Wooden Checker Clack (Tavla Tahtası "Şak", Ahşap Oturma ve Pul Kırma Sesleri)
  public playCheckerMove(isHit: boolean = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // 1. Realistic Acoustic Solid Wood Clack ("Tok" / "Şak" ahşap masaya oturma sesi)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = isHit ? 410 : 310;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + (isHit ? 0.09 : 0.065));

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHit ? 1600 : 1100, now);
    filter.Q.setValueAtTime(isHit ? 2.8 : 2.0, now);

    const initialGain = isHit ? 0.65 : 0.42;
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHit ? 0.14 : 0.085));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isHit ? 0.15 : 0.09));

    // 2. Secondary Walnut Board Resonance (Tavla kasasının derinden yankılanan ahşap gövde rezonansı)
    const woodThud = this.ctx.createOscillator();
    const woodThudGain = this.ctx.createGain();
    woodThud.type = 'sine';
    woodThud.frequency.setValueAtTime(isHit ? 165 : 130, now);
    woodThud.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    woodThudGain.gain.setValueAtTime(isHit ? 0.45 : 0.28, now);
    woodThudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    woodThud.connect(woodThudGain);
    woodThudGain.connect(this.ctx.destination);
    woodThud.start(now);
    woodThud.stop(now + 0.09);

    // 3. If a Checker is Hit (Pul Kırıldığında Çifte Tokmak ve Kırılma Efekti)
    if (isHit) {
      // Direct hard impact crack (pulun pula çarpma tok şakırtısı)
      const crack = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      const crackFilter = this.ctx.createBiquadFilter();

      crack.type = 'sawtooth';
      crack.frequency.setValueAtTime(860, now + 0.008);
      crack.frequency.exponentialRampToValueAtTime(140, now + 0.07);

      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(1800, now + 0.008);
      crackFilter.Q.setValueAtTime(3.5, now + 0.008);

      crackGain.gain.setValueAtTime(0.48, now + 0.008);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.ctx.destination);

      crack.start(now + 0.008);
      crack.stop(now + 0.08);

      // Kırık Pul Seslendirmesi (Doğal ve gerçekçi Türkçe nida: "Kırıldı!", "Açık aldım!")
      this.playRealisticHitVoice();
    }
  }

  // Realistic Turkish Cafe Voice Reaction on Hit ("Kırıldı!", "Açık alındı!")
  public playRealisticHitVoice() {
    if (!this.enabled || typeof window === 'undefined') return;

    // Use Web Speech API if available for realistic cafe commentary, with strict debounce
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel any pending audio to avoid queue clutter

        const phrases = [
          'Kırıldı!',
          'Açık kapıldı!',
          'Hoppa, bara!',
          'Kırık pul ortada!',
          'Açığı yakaladık!',
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];

        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.15; // Natural quick conversational speed
        utterance.pitch = 0.95; // Warm, mature cafe patron pitch
        utterance.volume = 0.85;

        // Try to pick a natural Turkish voice if present
        const voices = window.speechSynthesis.getVoices();
        const trVoice = voices.find((v) => v.lang.startsWith('tr') || v.lang.includes('TR'));
        if (trVoice) {
          utterance.voice = trVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  }

  // Okey Tile Tap (Authentic Heavy Melamine / Bone Stone "Tık-Tak" on Solid Wood Istaka)
  public playOkeyTileTap() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. High frequency ceramic/melamine micro-click (Taşın keskin porselenimsi ilk çarpma tık sesi)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(700, now + 0.015);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2400, now);
    clickFilter.Q.setValueAtTime(3.5, now);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.02);

    // 2. Heavy Melamine Body Resonance (Ağır kemik/ürea taşın tok gövde sesi)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    const bodyFilter = this.ctx.createBiquadFilter();

    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(580, now + 0.002);
    bodyOsc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(1400, now + 0.002);

    bodyGain.gain.setValueAtTime(0.40, now + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);

    bodyOsc.start(now + 0.002);
    bodyOsc.stop(now + 0.055);

    // 3. Solid Beechwood Istaka Shelf Thud (Masif ahşap ıstaka tablasının tok oturma yankısı)
    const woodThud = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();

    woodThud.type = 'sine';
    woodThud.frequency.setValueAtTime(170, now + 0.005);
    woodThud.frequency.exponentialRampToValueAtTime(65, now + 0.04);

    woodGain.gain.setValueAtTime(0.25, now + 0.005);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    woodThud.connect(woodGain);
    woodGain.connect(this.ctx.destination);

    woodThud.start(now + 0.005);
    woodThud.stop(now + 0.05);
  }

  // Okey Tile Slide / Place (Taşın ıstaka yuvasına kaydırılarak yerleştirilme sesi)
  public playOkeyTileSlide() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Wood surface friction slide
    const slideOsc = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    const slideFilter = this.ctx.createBiquadFilter();

    slideOsc.type = 'triangle';
    slideOsc.frequency.setValueAtTime(750, now);
    slideOsc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    slideFilter.type = 'bandpass';
    slideFilter.frequency.setValueAtTime(1200, now);
    slideFilter.Q.setValueAtTime(2.0, now);

    slideGain.gain.setValueAtTime(0.22, now);
    slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    slideOsc.connect(slideFilter);
    slideFilter.connect(slideGain);
    slideGain.connect(this.ctx.destination);

    slideOsc.start(now);
    slideOsc.stop(now + 0.05);
  }

  // Okey Group Slide (Toplu taş/per taşıma sesi - çoklu taşların ahşapta birlikte kayması)
  public playGroupSlide() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Multi-click clatter of 3-4 tiles sliding and clacking together
    [0, 0.02, 0.045].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950 - idx * 120, now + offset);
      osc.frequency.exponentialRampToValueAtTime(280, now + offset + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 - idx * 200, now + offset);
      filter.Q.setValueAtTime(3.0, now + offset);

      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.065);
    });
  }

  // Traditional Ince Belli Turkish Tea Glass & Spoon Stirring Sound ("Çay Çınlaması")
  public playTeaService() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const clinks = [
      { t: 0.0, freq: 3200 },
      { t: 0.08, freq: 3450 },
      { t: 0.16, freq: 3250 },
      { t: 0.28, freq: 3600 },
    ];

    clinks.forEach(({ t, freq }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + t);

      gain.gain.setValueAtTime(0.18, now + t);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + 0.35);
    });
  }

  // Waiter Service Bell ("Masa Siparişi Çanı")
  public playWaiterBell() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // A6
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(3520, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 1.2);
    oscHarmonic.stop(now + 1.2);
  }

  // Victory Fanfare & Okey Finishing Sound
  public playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { t: 0.0, freq: 440, dur: 0.18 }, // A4
      { t: 0.18, freq: 554.37, dur: 0.18 }, // C#5
      { t: 0.36, freq: 659.25, dur: 0.22 }, // E5
      { t: 0.58, freq: 880, dur: 0.6 }, // A5
    ];

    notes.forEach(({ t, freq, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + t);

      gain.gain.setValueAtTime(0.28, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  }

  public playVictoryFanfare() {
    this.playVictory();
  }

  public playLossFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { t: 0.0, freq: 440, dur: 0.22 },
      { t: 0.22, freq: 415.3, dur: 0.22 },
      { t: 0.44, freq: 392, dur: 0.25 },
      { t: 0.70, freq: 349.23, dur: 0.65 },
    ];

    notes.forEach(({ t, freq, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + t);

      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  }

  public playTavlaGatePass() {
    this.playOkeyTileTap();
  }

  public playButtonWoodClick() {
    this.playChessMove();
  }

  public playBonusBeep() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Çanak Kırma Sound: Authentic ceramic/earthenware pot shatter & golden coin avalanche
  public playCanakKirma() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Ceramic shatter impact (sharp noise crack + resonant shard ping)
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1800, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseSource.start(now);

    // 2. Ceramic pot resonance crack
    const potFreqs = [740, 520, 310];
    potFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.18);
      gain.gain.setValueAtTime(0.25 / (idx + 1), now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.22);
    });

    // 3. Golden coins cascade (shower of metallic jingles)
    const coinPitches = [1760, 2093, 2637, 3135, 3520, 2349, 2793, 3951, 4186];
    coinPitches.forEach((pitch, i) => {
      if (!this.ctx) return;
      const delay = 0.08 + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now + delay);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.98, now + delay + 0.2);
      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  // Elevator Disc Shuffle Sound (Mekanik asansör motoru ve taşların dönerek karışma şakırtısı)
  public playElevatorShuffle() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Mechanical elevator motor hum (düşük frekanslı servo / dişli vızıltısı)
    const motorOsc = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    const motorFilter = this.ctx.createBiquadFilter();

    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(85, now);
    motorOsc.frequency.linearRampToValueAtTime(140, now + 0.4);
    motorOsc.frequency.linearRampToValueAtTime(105, now + 1.2);
    motorOsc.frequency.linearRampToValueAtTime(60, now + 1.8);

    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(320, now);

    motorGain.gain.setValueAtTime(0.01, now);
    motorGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
    motorGain.gain.setValueAtTime(0.22, now + 1.3);
    motorGain.gain.exponentialRampToValueAtTime(0.001, now + 1.85);

    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.ctx.destination);

    motorOsc.start(now);
    motorOsc.stop(now + 1.9);

    // 2. Continuous tumbling / churning melamine tile clatter bursts
    const clatterTimes = [0.15, 0.28, 0.42, 0.58, 0.74, 0.90, 1.06, 1.22, 1.38, 1.52];
    clatterTimes.forEach((t, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 - (i % 4) * 180, now + t);
      osc.frequency.exponentialRampToValueAtTime(350, now + t + 0.04);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 - (i % 3) * 220, now + t);
      filter.Q.setValueAtTime(3.2, now + t);

      gain.gain.setValueAtTime(0.26, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + 0.055);
    });
  }

  // Toggle Gentle Cafe Background Lounge Ambiance with Venue awareness
  public toggleCafeAmbiance(venueId: 'tarihi_han' | 'bogaz_teras' | 'modern_kafe' = 'tarihi_han') {
    this.initCtx();
    if (!this.ctx) return false;

    this.ambientMusicEnabled = !this.ambientMusicEnabled;

    if (!this.ambientMusicEnabled) {
      this.stopAmbiance();
      return false;
    }

    this.startVenueAmbiance(venueId);
    return true;
  }

  public setAmbianceVenue(venueId: 'tarihi_han' | 'bogaz_teras' | 'modern_kafe') {
    if (!this.ambientMusicEnabled || !this.ctx) return;
    this.stopAmbiance();
    this.startVenueAmbiance(venueId);
  }

  public stopAmbiance() {
    if (!this.ctx) return;
    if (this.ambientGain) {
      try {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      } catch {}
    }
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop(this.ctx!.currentTime + 0.4);
      } catch {}
    });
    this.ambientOscillators = [];
  }

  public startVenueAmbiance(venueId: 'tarihi_han' | 'bogaz_teras' | 'modern_kafe') {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.075, now + 1.8);
    this.ambientGain.connect(this.ctx.destination);

    let chordFrequencies: number[] = [];
    let filterCutoff = 450;

    if (venueId === 'bogaz_teras') {
      // D minor 9th coastal calm chord (D2, A2, C3, E3, F#3)
      chordFrequencies = [73.42, 110.0, 130.81, 164.81, 185.0];
      filterCutoff = 380;
    } else if (venueId === 'modern_kafe') {
      // F major 9th sophisticated smooth jazz lounge (F2, C3, E3, G3, A3)
      chordFrequencies = [87.31, 130.81, 164.81, 196.0, 220.0];
      filterCutoff = 520;
    } else {
      // Tarihi Han: A warm minor 9th oriental cafe drone (A1, E2, G2, B2, C3)
      chordFrequencies = [55.0, 82.41, 98.0, 123.47, 130.81];
      filterCutoff = 420;
    }

    this.ambientOscillators = chordFrequencies.map((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, now);

      osc.connect(filter);
      filter.connect(this.ambientGain!);
      osc.start(now);
      return osc;
    });
  }

  // Authentic 3D Heavy Walnut Chess Piece Move (Tactile wooden base placement with felt cushion)
  public playChessMove() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Body thud of solid rosewood / boxwood
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.05);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(3.2, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);

    // Felt tap high-freq click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1100, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.03);
  }

  // Heavy Chess Piece Capture Knock ("Tok!")
  public playChessCapture() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dual clack (one piece knocking other away)
    [0, 0.022].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 0 ? 320 : 180, now + offset);
      osc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.07);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(idx === 0 ? 900 : 550, now + offset);

      gain.gain.setValueAtTime(idx === 0 ? 0.45 : 0.55, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  // Dramatic Chess Check Alarm (Harmonic brass resonance)
  public playChessCheck() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [440, 659.25].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  // Dama Stone Slide & Tap (Türk Daması ağır ceviz pul sürüşü ve vuruşu)
  public playDamaMove() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Wood sliding friction
    const slideOsc = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    slideOsc.type = 'triangle';
    slideOsc.frequency.setValueAtTime(200, now);
    slideOsc.frequency.linearRampToValueAtTime(280, now + 0.04);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    slideGain.gain.setValueAtTime(0.18, now);
    slideGain.gain.linearRampToValueAtTime(0.01, now + 0.05);

    slideOsc.connect(filter);
    filter.connect(slideGain);
    slideGain.connect(this.ctx.destination);
    slideOsc.start(now);
    slideOsc.stop(now + 0.06);

    // Final firm wooden snap
    const tapOsc = this.ctx.createOscillator();
    const tapGain = this.ctx.createGain();
    tapOsc.type = 'sine';
    tapOsc.frequency.setValueAtTime(360, now + 0.04);
    tapOsc.frequency.exponentialRampToValueAtTime(90, now + 0.09);
    tapGain.gain.setValueAtTime(0.4, now + 0.04);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    tapOsc.connect(tapGain);
    tapGain.connect(this.ctx.destination);
    tapOsc.start(now + 0.04);
    tapOsc.stop(now + 0.11);
  }

  // Dama Multi-Capture Jump Snap ("Şrak!")
  public playDamaJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Dama King (Dama Olma) Crown Chime
  public playDamaCrown() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.28, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }
}

export const sounds = new SoundEffectsService();
