<template>
  <div class="rewards-page">
    <!-- Mobil Üst Bar -->
    <header class="top-bar">
      <button class="pixel-btn back-btn" @click="$router.push('/')">← Geri</button>
      <span class="page-title">🎁 Ödül Mağazası</span>
      <div class="pixel-badge pixel-badge--gold points-badge">⭐ {{ store.points }}</div>
    </header>

    <!-- Ödüller Listesi -->
    <main class="rewards-content">
      <div class="rewards-info-banner pixel-card">
        <span class="info-emoji">🛍️</span>
        <p class="info-text">Kazandığın puanları sevgilinden alacağın gerçek ödüllere ve özel şiirlere dönüştür!</p>
      </div>

      <div class="rewards-grid">
        <div
          v-for="reward in store.rewards"
          :key="reward.id"
          class="reward-card pixel-card"
          :class="{ 'poem-card': reward.type === 'poem' }"
        >
          <div class="reward-emoji">{{ reward.emoji }}</div>
          <h3 class="reward-title">{{ reward.title }}</h3>
          <p class="reward-desc">{{ reward.description }}</p>

          <div class="reward-footer">
            <span class="reward-cost">{{ reward.cost }} ⭐</span>
            <button
              class="pixel-btn pixel-btn--primary buy-btn"
              @click="handlePurchase(reward)"
              :disabled="store.points < reward.cost"
            >
              Satın Al
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Mobil Sabit Alt Navigasyon Barı -->
    <nav class="mobile-nav-bar">
      <div class="nav-item" @click="$router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Ana Sayfa</span>
      </div>
      <div class="nav-item" @click="$router.push('/ring')">
        <span class="nav-icon">🥊</span>
        <span class="nav-label">Ring</span>
      </div>
      <div class="nav-item" @click="$router.push('/')">
        <span class="nav-icon">🎯</span>
        <span class="nav-label">Görevler</span>
      </div>
      <div class="nav-item active" @click="$router.push('/rewards')">
        <span class="nav-icon">🎁</span>
        <span class="nav-label">Ödüller</span>
      </div>
      <div class="nav-item" @click="$router.push('/my-rewards')">
        <span class="nav-icon">📜</span>
        <span class="nav-label">Şiirler</span>
      </div>
    </nav>

    <!-- Başarı Modalı -->
    <transition name="fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click="showSuccessModal = false">
        <div class="modal pixel-card" @click.stop>
          <template v-if="purchasedType === 'poem'">
            <h3 class="modal-title">📜 Yeni Şiir Açıldı!</h3>
            <div class="poem-reveal pixel-card">
              <h4 class="poem-title">{{ purchasedPoem?.title }}</h4>
              <pre class="poem-content">{{ purchasedPoem?.content }}</pre>
            </div>
            <p class="modal-sub">Bu şiir "Sandığım" sayfasına eklendi!</p>
          </template>
          <template v-else>
            <h3 class="modal-title">🎉 Tebrikler!</h3>
            <div class="modal-big-emoji">🎁</div>
            <p class="modal-desc">Ödül başarıyla satın alındı! Sevgilinden istemeyi unutma!</p>
          </template>
          <button class="pixel-btn pixel-btn--primary modal-close-btn" @click="showSuccessModal = false">
            Harika 💕
          </button>
        </div>
      </div>
    </transition>

    <!-- Hata Modalı -->
    <transition name="fade">
      <div v-if="errorMsg" class="modal-overlay" @click="errorMsg = ''">
        <div class="modal pixel-card" @click.stop>
          <h3 class="modal-title">⚠️ Uyarı</h3>
          <p class="modal-desc">{{ errorMsg }}</p>
          <button class="pixel-btn pixel-btn--danger modal-close-btn" @click="errorMsg = ''">Tamam</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store, purchaseReward } from '../store.js';
import { soundEngine } from '../soundEngine.js';

export default {
  name: 'RewardsView',
  data() {
    return {
      store,
      showSuccessModal: false,
      purchasedType: '',
      purchasedPoem: null,
      errorMsg: '',
    };
  },
  methods: {
    handlePurchase(reward) {
      const result = purchaseReward(reward.id);
      if (result.success) {
        soundEngine.playVictory();
        this.purchasedType = result.type;
        if (result.type === 'poem') {
          this.purchasedPoem = result.poem;
        }
        this.showSuccessModal = true;
      } else {
        soundEngine.playBonk();
        this.errorMsg = result.error;
      }
    },
  },
};
</script>

<style scoped>
.rewards-page {
  min-height: 100vh;
  padding-bottom: 74px;
  background: var(--bg-primary);
}

.top-bar {
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

.page-title {
  font-size: 0.75rem;
  color: var(--pink);
  font-weight: bold;
}

.points-badge {
  font-size: 0.6rem;
}

.rewards-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rewards-info-banner {
  background: linear-gradient(135deg, #fff2f6, #ffe8ef);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
}

.info-emoji {
  font-size: 1.8rem;
}

.info-text {
  font-size: 0.52rem;
  color: var(--text-main);
  line-height: 1.4;
}

.rewards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reward-card {
  padding: 14px;
  background: #ffffff;
  border-radius: 12px;
}

.reward-card.poem-card {
  border-color: var(--lavender);
  background: linear-gradient(135deg, #ffffff 0%, #faf8ff 100%);
}

.reward-emoji {
  font-size: 2rem;
  margin-bottom: 6px;
}

.reward-title {
  font-size: 0.68rem;
  color: var(--pixel-border);
  margin-bottom: 4px;
}

.reward-desc {
  font-size: 0.5rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 12px;
}

.reward-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-cost {
  font-size: 0.65rem;
  color: #f59f00;
  font-weight: bold;
}

.buy-btn {
  font-size: 0.55rem;
  padding: 6px 12px;
}

/* Modallar */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43, 24, 54, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  text-align: center;
}

.modal-title {
  font-size: 0.75rem;
  color: var(--pink);
  margin-bottom: 12px;
}

.modal-big-emoji {
  font-size: 3rem;
  margin: 10px 0;
}

.modal-desc {
  font-size: 0.55rem;
  color: var(--text-main);
  margin-bottom: 16px;
  line-height: 1.4;
}

.modal-sub {
  font-size: 0.48rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.poem-reveal {
  background: #fff8fb;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  text-align: left;
}

.poem-title {
  font-size: 0.65rem;
  color: var(--lavender);
  margin-bottom: 8px;
}

.poem-content {
  font-family: var(--font-pixel);
  font-size: 0.45rem;
  color: var(--text-main);
  line-height: 1.8;
  white-space: pre-wrap;
}

.modal-close-btn {
  width: 100%;
  font-size: 0.6rem;
  padding: 10px;
}
</style>
