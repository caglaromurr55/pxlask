<template>
  <div class="ring-page">
    <!-- Mobil Üst Bar -->
    <header class="ring-top-bar">
      <button class="pixel-btn back-btn" @click="$router.push('/')">← Geri</button>
      <div class="ring-title-badge">🥊 Aşk Ringi</div>
      <div class="top-bar-right">
        <button class="pixel-btn mute-btn" @click="toggleSound" :title="isMuted ? 'Sesi Aç' : 'Sesi Kapat'">
          {{ isMuted ? '🔇' : '🔊' }}
        </button>
        <div class="pixel-badge pixel-badge--gold points-badge">⭐ {{ store.points }}</div>
      </div>
    </header>

    <!-- Ring Sahnesi -->
    <main class="ring-stage-container">
      <div class="ring-arena pixel-card">
        <!-- Arka Plan Işıkları ve Kalp Pankartı -->
        <div class="arena-decor">
          <span class="arena-banner">❤️ AŞK ARENASI ❤️</span>
        </div>

        <!-- 1.000.000 CAN (HP) BAR SİSTEMİ -->
        <div class="boss-hp-section">
          <div class="hp-info-header">
            <span class="hp-label">❤️ SEVGİLİNİN CANI:</span>
            <span class="hp-numbers">{{ formatNumber(store.boyfriendHp) }} / {{ formatNumber(store.maxHp) }}</span>
          </div>
          <div class="hp-bar-outer">
            <div
              class="hp-bar-inner"
              :style="{ width: hpPercent + '%' }"
              :class="hpColorClass"
            ></div>
            <span class="hp-percent-text">%{{ hpPercent.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Boks Ringi Kafesi -->
        <div class="ring-box">
          <div class="ring-rope rope-1" :class="{ 'rope-shake': isHitting }"></div>
          <div class="ring-rope rope-2" :class="{ 'rope-shake': isHitting }"></div>
          <div class="ring-rope rope-3" :class="{ 'rope-shake': isHitting }"></div>

          <div class="corner-post corner-left"></div>
          <div class="corner-post corner-right"></div>

          <!-- Karakter Alanı (Tıklanabilir Vuruş Alanı) -->
          <div
            class="character-touch-zone"
            @click="handleAttack"
            :class="{ 'shaking': isHitting }"
          >
            <!-- Konuşma Baloncuğu (30 Farklı İfade) -->
            <transition name="pop">
              <div v-if="currentQuote" class="speech-bubble">
                <span class="quote-text">{{ currentQuote }}</span>
                <div class="speech-arrow"></div>
              </div>
            </transition>

            <!-- Uçan Kombo / Hasar Sayıları -->
            <div class="floating-effects">
              <transition-group name="float-up">
                <div
                  v-for="eff in activeEffects"
                  :key="eff.id"
                  class="floating-pop"
                  :style="{ left: eff.x + 'px', top: eff.y + 'px', color: eff.color }"
                >
                  {{ eff.text }}
                </div>
              </transition-group>
            </div>

            <!-- Silah Vuruş Animasyon Efektleri Katmanı -->
            <!-- 1. Tokat Animasyonu -->
            <div v-if="weaponAnim === 'hand'" class="anim-hand-slap">
              <span class="slap-hand">👋</span>
              <span class="slap-impact">💥 ŞLAAAP!</span>
            </div>

            <!-- 2. Domates Fırlatma & Cıvıma -->
            <div v-if="weaponAnim === 'tomato'" class="anim-tomato">
              <span class="flying-tomato">🍅</span>
              <div class="tomato-splat">
                <span class="splat-core">🥫</span>
                <span class="splat-text">SPLAAAT!</span>
              </div>
            </div>

            <!-- 3. Uçan Terlik -->
            <div v-if="weaponAnim === 'slipper'" class="anim-slipper">
              <span class="flying-slipper">🩴</span>
              <span class="slipper-impact">ÇAAAAT!</span>
            </div>

            <!-- 4. Tava / Sopa / Oklava -->
            <div v-if="['pan', 'stick', 'bat'].includes(weaponAnim)" class="anim-bonk">
              <span class="bonk-weapon">{{ activeWeaponEmoji }}</span>
              <span class="bonk-impact">BONKKK!</span>
            </div>

            <!-- 5. Silah / Su Tabancası -->
            <div v-if="weaponAnim === 'gun'" class="anim-gun">
              <span class="gun-flash">💥 PEW PEW!</span>
              <span class="water-beam">💦💦💦</span>
            </div>

            <!-- ============================================
                 KARAKTER: ÖZEL PNG VEYA DAHİLİ PİKSEL MODEL
                 ============================================ -->
            <!-- 1. Kullanıcının Kendi PNG Pixel Art Görseli Varsa -->
            <div v-if="hasCustomAvatar" class="custom-avatar-wrapper" :class="{ 'char-hurt': isHitting }">
              <img
                :src="isHitting && hasCustomHitAvatar ? '/avatar-hit.png' : '/avatar.png'"
                alt="Sevgili Pixel Art"
                class="custom-pixel-img"
                @error="handleAvatarError"
              />
              <div v-if="isHitting" class="dizzy-stars">💫 ✦ 💫</div>
            </div>

            <!-- 2. Varsayılan Dahili CSS Piksel Karakter Modeli (Yedek) -->
            <div v-else class="pixel-boyfriend" :class="{ 'char-hurt': isHitting }">
              <div class="char-head-box">
                <div class="char-hair"></div>
                <div class="char-face">
                  <div class="char-eyes-mouth">
                    {{ isHitting ? currentHurtEmoji : '🥺' }}
                  </div>
                  <div class="blush-cheeks">
                    <span class="blush"></span>
                    <span class="blush"></span>
                  </div>
                </div>
                <div v-if="isHitting" class="dizzy-stars">💫 ✦ 💫</div>
              </div>

              <div class="char-torso-box">
                <div class="char-shirt">
                  <span class="shirt-heart">❤️</span>
                </div>
                <div class="char-arms-box">
                  <div class="char-arm arm-l" :class="{ 'arm-hurt': isHitting }">✊</div>
                  <div class="char-arm arm-r" :class="{ 'arm-hurt': isHitting }">✊</div>
                </div>
              </div>

              <div class="char-legs-box">
                <div class="char-shorts"></div>
                <div class="char-feet">
                  <div class="foot">👟</div>
                  <div class="foot">👟</div>
                </div>
              </div>
            </div>

            <!-- Dokunma İpucu (İlk girişte) -->
            <div v-if="hitCount === 0 && !isHitting" class="tap-hint">
              👆 Üzerime dokun ve beni döv!
            </div>
          </div>

          <!-- Ring Zemini (Canvas Mat) -->
          <div class="ring-floor-mat">
            <span class="mat-logo">⭐ AŞK MATI ⭐</span>
          </div>
        </div>

        <!-- İstatistik & Kombo Barı -->
        <div class="arena-footer">
          <div class="stat-pill">
            <span class="stat-label">Toplam Vuruş:</span>
            <span class="stat-num">{{ hitCount }}</span>
          </div>
          <div class="combo-pill" v-if="comboCount > 1" :class="{ 'fever': comboCount >= 5 }">
            🔥 {{ comboCount }}x KOMBO!
          </div>
        </div>
      </div>
    </main>

    <!-- Aktif Malzeme & Envanter Seçim Çekmecesi (Mobile Dock) -->
    <section class="inventory-section">
      <div class="inventory-header">
        <span class="inv-title">🎒 Envanter (Malzeme Seç):</span>
        <span class="inv-selected-tag">
          {{ selectedMaterial?.emoji }} {{ selectedMaterial?.name }} ({{ selectedMaterial?.damage }})
        </span>
      </div>

      <!-- Yatay Kaydırılabilir Envanter Listesi -->
      <div class="inventory-scroll">
        <div
          v-for="mat in store.materials"
          :key="mat.id"
          class="inventory-item pixel-card"
          :class="{
            'active': selectedMaterial?.id === mat.id,
            'locked': !isUnlocked(mat.id)
          }"
          @click="selectOrUnlock(mat)"
        >
          <div class="item-icon-box">
            <span class="item-emoji">{{ isUnlocked(mat.id) ? mat.emoji : '🔒' }}</span>
          </div>
          <span class="item-name">{{ isUnlocked(mat.id) ? mat.name : 'Kilitli' }}</span>

          <span class="item-dmg-badge" v-if="isUnlocked(mat.id)">
            -{{ mat.damageValue }} HP
          </span>

          <span v-if="isUnlocked(mat.id)" class="item-tag-unlocked">
            {{ selectedMaterial?.id === mat.id ? 'SEÇİLİ' : 'HAZIR' }}
          </span>
          <span v-else class="item-tag-locked">
            {{ mat.unlockCost }} ⭐
          </span>
        </div>
      </div>
    </section>

    <!-- NAKAVT & PES ETME ZAFER MODALI (+1000 PUAN!) -->
    <transition name="fade">
      <div v-if="showDefeatModal" class="modal-overlay" @click="closeDefeatModal">
        <div class="defeat-dialog pixel-card" @click.stop>
          <div class="white-flag">🏳️</div>
          <h2 class="defeat-title">TAMAM AŞKIM PES!</h2>
          <div class="defeat-avatar-preview">😵💫</div>
          <p class="defeat-quote">"Tamam aşkım pes ediyorum, canımı sıfırladın! Al bu puanlar senin olsun!"</p>

          <div class="reward-highlight pixel-card">
            <span class="reward-pts-text">+1000 ⭐</span>
            <span class="reward-pts-sub">ZAFER ÖDÜLÜ HESABINA EKLENDİ!</span>
          </div>

          <p class="revive-hint">Canın tekrar 1.000.000 olarak yenilendi. Beni dövmeye devam edebilirsin!</p>

          <button class="pixel-btn pixel-btn--primary resume-btn" @click="closeDefeatModal">
            💖 Canımı Yenile & Devam Et
          </button>
        </div>
      </div>
    </transition>

    <!-- Kilit Açma Modalı -->
    <transition name="fade">
      <div v-if="showUnlockModal" class="modal-overlay" @click="showUnlockModal = false">
        <div class="unlock-dialog pixel-card" @click.stop>
          <h3 class="dialog-title">🔓 Malzeme Kilidi Aç</h3>
          <div class="dialog-emoji">{{ unlockTarget?.emoji }}</div>
          <p class="dialog-name">{{ unlockTarget?.name }}</p>
          <p class="dialog-damage">Hasar Gücü: <strong>-{{ unlockTarget?.damageValue }} HP</strong></p>
          <p class="dialog-cost">Gereken Puan: <strong>{{ unlockTarget?.unlockCost }} ⭐</strong></p>
          <p class="dialog-balance">Mevcut Bakiyen: <strong>{{ store.points }} ⭐</strong></p>

          <div class="dialog-actions">
            <button
              class="pixel-btn pixel-btn--primary confirm-btn"
              @click="confirmUnlock"
              :disabled="store.points < unlockTarget?.unlockCost"
            >
              ✅ Kilidi Aç
            </button>
            <button class="pixel-btn pixel-btn--danger cancel-btn" @click="showUnlockModal = false">
              ❌ Vazgeç
            </button>
          </div>
          <p v-if="unlockError" class="dialog-error">{{ unlockError }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, unlockMaterial, damageBoyfriend } from '../store.js';
import { soundEngine } from '../soundEngine.js';

export default {
  name: 'RingView',
  data() {
    return {
      store,
      selectedMaterial: null,
      isHitting: false,
      hitCount: parseInt(localStorage.getItem('pixelask_hitcount') || '0', 10),
      currentQuote: '',
      quoteTimeout: null,
      weaponAnim: null,
      activeWeaponEmoji: '👋',
      isMuted: soundEngine.isMuted,

      // Kombo Sayacı
      comboCount: 0,
      comboTimer: null,

      // Zarar İfadeleri
      hurtEmojis: ['😵', '🤕', '😫', '🥴', '😭', '🥺', '💫', '💔'],
      currentHurtEmoji: '😵',

      // Uçan efektler
      activeEffects: [],
      effectCounter: 0,

      // Özel Avatar PNG Kontrolü
      hasCustomAvatar: false,
      hasCustomHitAvatar: false,

      // Pes Etme / Nakavt Modalı (+1000 Puan)
      showDefeatModal: false,

      // Kilit Açma Modalı
      showUnlockModal: false,
      unlockTarget: null,
      unlockError: '',
    };
  },
  computed: {
    hpPercent() {
      const max = store.maxHp || 1000000;
      const current = store.boyfriendHp !== undefined ? store.boyfriendHp : 1000000;
      return Math.max(0, Math.min(100, (current / max) * 100));
    },
    hpColorClass() {
      if (this.hpPercent > 50) return 'hp-green';
      if (this.hpPercent > 20) return 'hp-yellow';
      return 'hp-red';
    }
  },
  created() {
    // Varsayılan malzeme olarak "El / Tokat"ı seç
    const hand = store.materials.find(m => m.id === 'mat0') || store.materials[0];
    this.selectedMaterial = hand;

    // Özel avatar PNG'si var mı kontrol et
    this.checkCustomAvatar();
  },
  methods: {
    formatNumber(num) {
      if (num === undefined || num === null) return '1.000.000';
      return num.toLocaleString('tr-TR');
    },
    checkCustomAvatar() {
      const img = new Image();
      img.onload = () => {
        this.hasCustomAvatar = true;
      };
      img.onerror = () => {
        this.hasCustomAvatar = false;
      };
      img.src = '/avatar.png';

      const hitImg = new Image();
      hitImg.onload = () => {
        this.hasCustomHitAvatar = true;
      };
      hitImg.src = '/avatar-hit.png';
    },
    handleAvatarError() {
      this.hasCustomAvatar = false;
    },
    isUnlocked(matId) {
      return store.unlockedMaterials.includes(matId);
    },
    toggleSound() {
      this.isMuted = soundEngine.toggleMute();
    },
    selectOrUnlock(mat) {
      if (this.isUnlocked(mat.id)) {
        this.selectedMaterial = mat;
        soundEngine.playCoin();
      } else {
        this.unlockTarget = mat;
        this.unlockError = '';
        this.showUnlockModal = true;
      }
    },
    confirmUnlock() {
      if (!this.unlockTarget) return;
      const res = unlockMaterial(this.unlockTarget.id);
      if (res.success) {
        soundEngine.playVictory();
        this.selectedMaterial = this.unlockTarget;
        this.showUnlockModal = false;
      } else {
        this.unlockError = res.error;
      }
    },
    closeDefeatModal() {
      this.showDefeatModal = false;
    },
    handleAttack(e) {
      if (!this.selectedMaterial) {
        this.selectedMaterial = store.materials[0];
      }

      const dmg = this.selectedMaterial.damageValue || 1;

      // Hasar verme mekaniği
      const result = damageBoyfriend(dmg);

      // Hızlı tıklama animasyonunu tetikle
      this.isHitting = true;
      this.currentHurtEmoji = this.hurtEmojis[Math.floor(Math.random() * this.hurtEmojis.length)];
      this.activeWeaponEmoji = this.selectedMaterial.emoji;
      this.weaponAnim = this.selectedMaterial.type || 'hand';

      // Sayaç artışı
      this.hitCount++;
      localStorage.setItem('pixelask_hitcount', this.hitCount.toString());

      // Kombo sistemi
      this.comboCount++;
      if (this.comboTimer) clearTimeout(this.comboTimer);
      this.comboTimer = setTimeout(() => {
        this.comboCount = 0;
      }, 1800);

      // Ses efekti & Titreşim
      soundEngine.playHitSound(this.selectedMaterial.type);

      // Sevgili nakavt oldu mu?
      if (result.isDefeated) {
        soundEngine.playVictory();
        const defeatQuote = "Tamam aşkım pes ediyorum al bu puanlar senin!";
        this.currentQuote = defeatQuote;
        soundEngine.speak(defeatQuote);
        this.showDefeatModal = true;
        this.spawnDamageEffect(dmg, true);
      } else {
        // Normal rastgele acı sözü al ve konuşma balonunda göster
        const quote = soundEngine.getRandomQuote();
        this.currentQuote = quote;
        soundEngine.speak(quote);

        if (this.quoteTimeout) clearTimeout(this.quoteTimeout);
        this.quoteTimeout = setTimeout(() => {
          this.currentQuote = '';
        }, 2200);

        this.spawnDamageEffect(dmg, false);
      }

      // Animasyonu sıfırla
      setTimeout(() => {
        this.isHitting = false;
        this.weaponAnim = null;
      }, 450);
    },
    spawnDamageEffect(dmg, isDefeated = false) {
      const text = isDefeated ? '👑 NAKAVT! -' + dmg : '-' + dmg + ' HP';
      const color = isDefeated ? '#f59f00' : '#ff2a5f';

      const eff = {
        id: ++this.effectCounter,
        text,
        color,
        x: Math.floor(Math.random() * 80) - 40,
        y: Math.floor(Math.random() * 30) - 20,
      };

      this.activeEffects.push(eff);
      setTimeout(() => {
        this.activeEffects = this.activeEffects.filter(item => item.id !== eff.id);
      }, 700);
    }
  }
};
</script>

<style scoped>
.ring-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-bottom: 24px;
}

/* Üst Bar */
.ring-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 3px solid var(--pixel-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  font-size: 0.55rem;
  padding: 6px 10px;
}

.ring-title-badge {
  font-size: 0.75rem;
  color: var(--pink);
  font-weight: bold;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mute-btn {
  padding: 6px 8px;
  font-size: 0.7rem;
}

.points-badge {
  font-size: 0.6rem;
}

/* Ring Sahnesi */
.ring-stage-container {
  padding: 12px 14px 6px 14px;
  flex: 1;
}

.ring-arena {
  background: linear-gradient(180deg, #fff2f6 0%, #ffe0ea 100%);
  padding: 10px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

/* Pankart */
.arena-decor {
  text-align: center;
  margin-bottom: 6px;
}

.arena-banner {
  display: inline-block;
  font-size: 0.52rem;
  padding: 3px 10px;
  background: #ffffff;
  border: 2px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  color: var(--pink);
  border-radius: 10px;
}

/* ============================================
   1.000.000 CAN (HP) BARI
   ============================================ */
.boss-hp-section {
  background: #ffffff;
  border: 2px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.hp-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.hp-label {
  font-size: 0.48rem;
  color: var(--pixel-border);
  font-weight: bold;
}

.hp-numbers {
  font-size: 0.48rem;
  color: #d90429;
  font-weight: bold;
}

.hp-bar-outer {
  position: relative;
  width: 100%;
  height: 18px;
  background: #f0e2eb;
  border: 2px solid var(--pixel-border);
  border-radius: 9px;
  overflow: hidden;
}

.hp-bar-inner {
  height: 100%;
  transition: width 0.2s ease-out;
  border-radius: 7px;
}

.hp-green {
  background: linear-gradient(90deg, #51cf66, #2b8a3e);
}

.hp-yellow {
  background: linear-gradient(90deg, #fcc419, #e67700);
}

.hp-red {
  background: linear-gradient(90deg, #ff6b6b, #c92a2a);
}

.hp-percent-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.45rem;
  color: #2b1b36;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 0 0 2px rgba(255,255,255,0.8);
}

/* Boks Ringi Kafesi */
.ring-box {
  position: relative;
  height: 330px;
  background: #ffffff;
  border: 3px solid var(--pixel-border);
  box-shadow: inset 0 0 20px rgba(255, 94, 136, 0.12);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* Ring İpleri */
.ring-rope {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  z-index: 10;
  border-top: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: transform 0.08s ease;
}

.rope-1 { top: 65px; background: #ff5e88; }
.rope-2 { top: 125px; background: #ffd166; }
.rope-3 { top: 185px; background: #4dabf7; }

.rope-shake {
  animation: ropeVibrate 0.25s ease-in-out;
}

@keyframes ropeVibrate {
  0% { transform: translateY(0); }
  25% { transform: translateY(-5px); }
  50% { transform: translateY(4px); }
  75% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

/* Köşe Direkleri */
.corner-post {
  position: absolute;
  top: 0;
  bottom: 40px;
  width: 14px;
  z-index: 11;
  border: 2px solid var(--pixel-border);
}

.corner-left { left: 6px; background: #ff5e88; }
.corner-right { right: 6px; background: #4dabf7; }

/* Tıklanabilir Karakter Alanı */
.character-touch-zone {
  position: absolute;
  top: 15px;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  touch-action: manipulation;
}

.shaking {
  animation: hitShake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes hitShake {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(5px, -2px, 0); }
  30%, 50%, 70% { transform: translate3d(-6px, 2px, 0); }
  40%, 60% { transform: translate3d(6px, -1px, 0); }
}

/* Konuşma Baloncuğu */
.speech-bubble {
  position: absolute;
  top: -24px;
  background: #ffffff;
  border: 3px solid var(--pixel-border);
  box-shadow: 3px 3px 0 var(--pixel-shadow);
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 86%;
  z-index: 50;
  text-align: center;
  pointer-events: none;
}

.quote-text {
  font-size: 0.55rem;
  color: #ff3366;
  font-weight: bold;
  line-height: 1.4;
}

.speech-arrow {
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 8px solid var(--pixel-border);
}

/* Uçan Hasar / Efektler */
.floating-effects {
  position: absolute;
  pointer-events: none;
  z-index: 45;
}

.floating-pop {
  position: absolute;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  animation: popFloat 0.65s ease-out forwards;
  text-shadow: 1px 1px 0px #fff;
}

@keyframes popFloat {
  0% { transform: translateY(0) scale(0.6); opacity: 1; }
  100% { transform: translateY(-50px) scale(1.3); opacity: 0; }
}

/* ============================================
   ÖZEL PNG AVATAR ENTEGRASYONU
   ============================================ */
.custom-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-pixel-img {
  width: 200px;
  height: 200px;
  max-width: 90%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(2px 5px 0px rgba(40, 20, 40, 0.3));
  transition: transform 0.1s ease;
  margin-top: 5px;
}

.char-hurt .custom-pixel-img {
  filter: saturate(2) hue-rotate(-25deg) drop-shadow(0 0 10px #ff0055);
  transform: scale(0.95);
}

/* Silah Görsel Efektleri */
.anim-hand-slap {
  position: absolute;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slapSweep 0.3s ease-out forwards;
}

.slap-hand {
  font-size: 3.5rem;
  transform: rotate(-25deg);
}

.slap-impact {
  font-size: 0.65rem;
  color: #ff2a5f;
  background: #fff;
  border: 2px solid var(--pixel-border);
  padding: 2px 6px;
  margin-top: 4px;
}

@keyframes slapSweep {
  0% { transform: translate(-60px, -20px) scale(0.6); opacity: 0.8; }
  50% { transform: translate(10px, 0px) scale(1.3); opacity: 1; }
  100% { transform: translate(30px, 10px) scale(1); opacity: 0; }
}

.anim-tomato {
  position: absolute;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flying-tomato {
  font-size: 2.5rem;
  animation: tomatoFly 0.25s ease-in forwards;
}

.tomato-splat {
  font-size: 1.2rem;
  animation: splatShow 0.35s ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.splat-core {
  font-size: 3rem;
  filter: drop-shadow(0 0 8px red);
}

.splat-text {
  font-size: 0.6rem;
  color: #d90429;
  font-weight: bold;
  background: #fff;
  border: 2px solid var(--pixel-border);
  padding: 2px 6px;
}

@keyframes tomatoFly {
  0% { transform: translateY(80px) scale(0.6); opacity: 1; }
  100% { transform: translateY(0) scale(1.1); opacity: 0; }
}

@keyframes splatShow {
  0% { transform: scale(0.4); opacity: 0; }
  50% { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.anim-slipper {
  position: absolute;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slipperSpin 0.35s ease-out forwards;
}

.flying-slipper { font-size: 3rem; }

.slipper-impact {
  font-size: 0.65rem;
  color: #9d84fe;
  background: #fff;
  border: 2px solid var(--pixel-border);
  padding: 2px 6px;
}

@keyframes slipperSpin {
  0% { transform: translate(-70px, -60px) rotate(0deg) scale(0.5); }
  60% { transform: translate(0, 0) rotate(540deg) scale(1.2); }
  100% { transform: translate(10px, 15px) rotate(720deg) scale(0.8); opacity: 0; }
}

.anim-bonk {
  position: absolute;
  top: 15px;
  right: 25px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bonkDown 0.3s ease-in forwards;
}

.bonk-weapon {
  font-size: 3rem;
  transform-origin: bottom right;
}

.bonk-impact {
  font-size: 0.65rem;
  color: #f59f00;
  background: #fff;
  border: 2px solid var(--pixel-border);
  padding: 2px 6px;
}

@keyframes bonkDown {
  0% { transform: rotate(-50deg) scale(0.8); }
  50% { transform: rotate(15deg) scale(1.3); }
  100% { transform: rotate(5deg) scale(1); opacity: 0; }
}

.anim-gun {
  position: absolute;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: gunBurst 0.35s ease-out forwards;
}

.gun-flash {
  font-size: 0.7rem;
  color: #00c9a7;
  background: #fff;
  border: 2px solid var(--pixel-border);
  padding: 2px 8px;
}

.water-beam { font-size: 2rem; }

@keyframes gunBurst {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

/* Dahili Piksel Karakter Modeli */
.pixel-boyfriend {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.1s ease;
  user-select: none;
}

.char-hurt {
  filter: saturate(1.8) hue-rotate(-20deg);
}

.char-head-box {
  position: relative;
  width: 72px;
  height: 64px;
  background: #ffe0bd;
  border: 3px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.char-hair {
  position: absolute;
  top: -8px;
  left: -4px;
  right: -4px;
  height: 22px;
  background: #4a2810;
  border: 3px solid var(--pixel-border);
  border-radius: 8px 8px 0 0;
}

.char-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.char-eyes-mouth {
  font-size: 1.6rem;
  line-height: 1;
}

.blush-cheeks {
  display: flex;
  gap: 36px;
  position: absolute;
  bottom: 8px;
}

.blush {
  width: 8px;
  height: 5px;
  background: #ff85a1;
  border-radius: 3px;
  opacity: 0.75;
}

.dizzy-stars {
  position: absolute;
  top: -24px;
  font-size: 0.7rem;
  animation: dizzySpin 1s linear infinite;
}

@keyframes dizzySpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.char-torso-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -2px;
}

.char-shirt {
  width: 60px;
  height: 48px;
  background: #ffffff;
  border: 3px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.shirt-heart { font-size: 0.8rem; }

.char-arms-box {
  position: absolute;
  width: 86px;
  display: flex;
  justify-content: space-between;
}

.char-arm { font-size: 1.1rem; }
.arm-hurt { transform: translateY(-8px) rotate(20deg); }

.char-legs-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -2px;
}

.char-shorts {
  width: 48px;
  height: 22px;
  background: #4dabf7;
  border: 3px solid var(--pixel-border);
}

.char-feet {
  display: flex;
  gap: 16px;
  margin-top: -4px;
}

.foot { font-size: 0.85rem; }

.tap-hint {
  position: absolute;
  bottom: 6px;
  font-size: 0.48rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--pixel-border);
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--text-main);
  animation: pulseHint 1.4s ease-in-out infinite alternate;
}

@keyframes pulseHint {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}

.ring-floor-mat {
  height: 42px;
  background: #e9ecef;
  border-top: 3px solid var(--pixel-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mat-logo {
  font-size: 0.5rem;
  color: #adb5bd;
  letter-spacing: 1px;
}

.arena-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 0 4px;
}

.stat-pill {
  font-size: 0.55rem;
  color: var(--text-main);
  background: #fff;
  border: 2px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-num {
  color: var(--pink);
  font-weight: bold;
  margin-left: 4px;
}

.combo-pill {
  font-size: 0.55rem;
  color: #fff;
  background: #f59f00;
  border: 2px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  padding: 4px 8px;
  border-radius: 6px;
  animation: bounceCombo 0.4s ease infinite alternate;
}

.combo-pill.fever {
  background: #ff5e88;
  font-weight: bold;
}

@keyframes bounceCombo {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

/* Envanter Bölümü (Dock) */
.inventory-section {
  padding: 8px 14px;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.inv-title {
  font-size: 0.55rem;
  color: var(--text-main);
}

.inv-selected-tag {
  font-size: 0.5rem;
  color: var(--pink);
  font-weight: bold;
}

.inventory-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.inventory-item {
  flex: 0 0 92px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 6px;
  border-radius: 10px;
  cursor: pointer;
  background: #ffffff;
  position: relative;
  transition: all 0.15s ease;
}

.inventory-item.active {
  border-color: var(--pink);
  background: #fff0f5;
  box-shadow: 3px 3px 0 var(--pink);
  transform: translateY(-2px);
}

.inventory-item.locked {
  opacity: 0.75;
  background: #f8f9fa;
}

.item-icon-box {
  width: 42px;
  height: 42px;
  background: #f8e8ee;
  border: 2px solid var(--pixel-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.item-emoji { font-size: 1.5rem; }

.item-name {
  font-size: 0.45rem;
  text-align: center;
  margin-bottom: 2px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 84px;
}

.item-dmg-badge {
  font-size: 0.42rem;
  color: #d90429;
  font-weight: bold;
  margin-bottom: 2px;
}

.item-tag-unlocked {
  font-size: 0.4rem;
  color: #00c9a7;
  font-weight: bold;
}

.inventory-item.active .item-tag-unlocked {
  color: var(--pink);
}

.item-tag-locked {
  font-size: 0.42rem;
  color: #f59f00;
  font-weight: bold;
}

/* ============================================
   PES ETME / NAKAVT MODALI
   ============================================ */
.defeat-dialog {
  width: 100%;
  max-width: 360px;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  border-color: var(--gold);
  box-shadow: 5px 5px 0 var(--pixel-shadow);
  animation: bouncePop 0.3s ease-out;
}

@keyframes bouncePop {
  0% { transform: scale(0.7); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.white-flag {
  font-size: 3rem;
  animation: waveFlag 1s ease-in-out infinite alternate;
}

@keyframes waveFlag {
  from { transform: rotate(-10deg); }
  to { transform: rotate(10deg); }
}

.defeat-title {
  font-size: 0.85rem;
  color: var(--pink);
  margin: 8px 0;
}

.defeat-avatar-preview {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.defeat-quote {
  font-size: 0.58rem;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 12px;
  font-style: italic;
}

.reward-highlight {
  background: #fff9db;
  border-color: var(--gold);
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.reward-pts-text {
  display: block;
  font-size: 1.2rem;
  color: #f59f00;
  font-weight: bold;
  margin-bottom: 4px;
}

.reward-pts-sub {
  font-size: 0.45rem;
  color: var(--text-muted);
}

.revive-hint {
  font-size: 0.48rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.resume-btn {
  width: 100%;
  font-size: 0.65rem;
  padding: 12px;
}

/* Kilit Açma Modalı */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(43, 24, 54, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.unlock-dialog {
  width: 100%;
  max-width: 340px;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.dialog-title {
  font-size: 0.75rem;
  color: var(--pixel-border);
  margin-bottom: 12px;
}

.dialog-emoji {
  font-size: 3rem;
  margin-bottom: 8px;
}

.dialog-name {
  font-size: 0.7rem;
  font-weight: bold;
  color: var(--pink);
  margin-bottom: 6px;
}

.dialog-damage {
  font-size: 0.55rem;
  color: #d90429;
  margin-bottom: 6px;
}

.dialog-cost,
.dialog-balance {
  font-size: 0.55rem;
  margin: 4px 0;
  color: var(--text-main);
}

.dialog-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: center;
}

.confirm-btn,
.cancel-btn {
  font-size: 0.55rem;
  padding: 8px 14px;
}

.dialog-error {
  color: var(--red);
  font-size: 0.5rem;
  margin-top: 10px;
}
</style>
