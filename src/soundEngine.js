/* ============================================
   SOUND & VOICE ENGINE (Web Audio & Speech)
   Tamamen tarayıcı içinde çalışan ses sentezleyici
   ve Türkçe ses/tepki sistemi
   ============================================ */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('pixelask_muted') === 'true';
    this.quotes = [
      "Aşkım vurma!",
      "Ah! Acıdı ama!",
      "Uh! Kıyamazsın sen bana...",
      "Özür dilerim aşkım, affet!",
      "Tamam pes, teslim oluyorum!",
      "Kalbim kırıldı bak!",
      "Yavaş vur güzelim, canım yandı!",
      "Gözüm karardı valla!",
      "Bir daha yapmıcam söz veriyorum!",
      "Dudaktan bir öpücük ver barışalım!",
      "Yandım anam bu ne güç!",
      "İmdat! Sevgilim beni dövüyor!",
      "En azından saçımı bozma aşkım!",
      "Peki bu terliğin suçu neydi?!",
      "Domates lekesi tişörtümden çıkmaz!",
      "Beni sevmeyi bıraktın mı yoksa?!",
      "Alo 155 mi? Sevgilim şiddet uyguluyor!",
      "Tamam sen haklısın, her zaman haklısın!",
      "Affet beni sultanım, kölen olayım!",
      "Oyy kafamda yıldızlar uçuşuyor!",
      "Kemiklerim gevşedi resmen!",
      "Aşkımız bu kadar sert miydi ya?!",
      "İnsaf be prensesim, acı biraz!",
      "Yarın bütün bulaşıklar benden söz!",
      "İstediğin tatlıyı alayım vurma!",
      "Daha hızlı vuramaz mısın? Şaka şaka!",
      "Beynim sarsıldı resmen!",
      "Canım acıdı ama seni hala çok seviyorum!",
      "Bir sarılsak mı acaba artık?!",
      "Yeter artık n'olur, canım çıktı aşkım!"
    ];
  }

  // Audio context başlatma
  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('pixelask_muted', this.isMuted.toString());
    return this.isMuted;
  }

  vibrate(pattern = [40]) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore mobile browser restrictions
      }
    }
  }

  // Rastgele acı sözü al
  getRandomQuote() {
    const idx = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[idx];
  }

  // Sesli okuma (Web Speech API)
  speak(text) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Öncekini kes
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.35; // Biraz daha sevimli/komik yüksek ton
      utterance.rate = 1.15;  // Hızlı ve panikli
      utterance.volume = 0.9;

      // Türkçe ses seçmeye çalış
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.startsWith('tr'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  // ================= 8-BIT RETRO SESLER =================

  // Tokat (El) Sesi
  playSlap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([35]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);

    // Beyaz gürültü patlaması (tokat şakırtısı)
    this.playNoise(0.08, 0.35);
  }

  // Domates Cıvıma/Splat Sesi
  playTomato() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([45]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
    this.playNoise(0.12, 0.25);
  }

  // Terlik Çarpma Sesi (Çat!)
  playSlipper() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([20, 20, 30]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
    this.playNoise(0.07, 0.4);
  }

  // Tava / Sopa Bonk Sesi (Metalik / Odunsu tınlama)
  playBonk() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([60]);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.28);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.28);
    osc2.stop(this.ctx.currentTime + 0.28);
  }

  // Silah / Su Tabancası Sesi (Pew Pew / Patlama)
  playGun() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([30, 20, 40]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Yıldız / Puan Kazanma Fanfarı
  playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [587.33, 880]; // D5 -> A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.18);
    });
  }

  // Görev Tamamlama Zafer Sesi
  playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.09 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.09);
      osc.stop(this.ctx.currentTime + idx * 0.09 + 0.25);
    });
  }

  // 10 Saniye Sayacı Tıkırtı Sesi (RPS Geri Sayımı)
  playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Ceza & Süre Bitti Buzzer Sesi
  playBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([150, 50, 150]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // Zar Sallama & Çıngırtı Sesi
  playDice() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300 + Math.random() * 300, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }, i * 60);
    }
  }

  // Ortak Fantezi Eşleşme Fanfarı
  playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.3);
    });
  }

  // Beyaz Gürültü Üretici (Şaplama/patlama hissi)
  playNoise(duration = 0.1, volume = 0.3) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + duration);
  }

  // Malzemeye göre ses çal
  playHitSound(materialType) {
    switch (materialType) {
      case 'hand':
        this.playSlap();
        break;
      case 'tomato':
        this.playTomato();
        break;
      case 'slipper':
        this.playSlipper();
        break;
      case 'pan':
      case 'stick':
      case 'bat':
        this.playBonk();
        break;
      case 'gun':
        this.playGun();
        break;
      default:
        this.playSlap();
    }
  }
}

export const soundEngine = new SoundEngine();
