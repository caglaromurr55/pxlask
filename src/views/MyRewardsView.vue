<template>
  <div class="my-rewards-page">
    <!-- Mobil Üst Bar -->
    <header class="top-bar">
      <button class="pixel-btn back-btn" @click="$router.push('/')">← Geri</button>
      <span class="page-title">📜 Sandığım</span>
      <div class="pixel-badge pixel-badge--gold points-badge">⭐ {{ store.points }}</div>
    </header>

    <main class="my-rewards-content">
      <!-- Sekmeler -->
      <div class="tabs-container">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'rewards' }"
          @click="activeTab = 'rewards'"
        >
          🎁 Ödüller ({{ store.acquiredRewards.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'poems' }"
          @click="activeTab = 'poems'"
        >
          📜 Şiirler ({{ store.acquiredPoems.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'fantasies' }"
          @click="activeTab = 'fantasies'"
        >
          🔥 Fanteziler ({{ store.matchedFantasies.length }})
        </button>
      </div>

      <!-- Ödüller Sekmesi -->
      <div v-if="activeTab === 'rewards'" class="tab-view">
        <div v-if="store.acquiredRewards.length === 0" class="empty-state pixel-card">
          <div class="empty-emoji">🎁</div>
          <p class="empty-text">Henüz ödül kazanmadın!</p>
          <button class="pixel-btn pixel-btn--primary" @click="$router.push('/rewards')">
            Ödül Mağazasına Git
          </button>
        </div>
        <div v-else class="items-list">
          <div v-for="reward in store.acquiredRewards" :key="reward.acquiredAt" class="item-card pixel-card">
            <span class="item-emoji">{{ reward.emoji }}</span>
            <div class="item-info">
              <h3 class="item-title">{{ reward.title }}</h3>
              <p class="item-desc">{{ reward.description }}</p>
              <span class="item-date">📅 {{ formatDate(reward.acquiredAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Şiirler Sekmesi -->
      <div v-if="activeTab === 'poems'" class="tab-view">
        <div v-if="store.acquiredPoems.length === 0" class="empty-state pixel-card">
          <div class="empty-emoji">📜</div>
          <p class="empty-text">Henüz açılmış şiirin yok!</p>
          <button class="pixel-btn pixel-btn--lavender" @click="$router.push('/rewards')">
            Şiir Aç (25 ⭐)
          </button>
        </div>
        <div v-else class="poems-list">
          <div v-for="poem in store.acquiredPoems" :key="poem.id" class="poem-card pixel-card">
            <div class="poem-header">
              <span class="poem-icon">💖</span>
              <h3 class="poem-title">{{ poem.title }}</h3>
            </div>
            <pre class="poem-content">{{ poem.content }}</pre>
            <div class="poem-footer">
              <span class="poem-date">Açılış: {{ formatDate(poem.acquiredAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ortak Fanteziler Sekmesi -->
      <div v-if="activeTab === 'fantasies'" class="tab-view">
        <div class="fantasies-intro-banner pixel-card">
          <span>🔥 <strong>Ortak Fantezilerimiz:</strong> İkinizin de "Bayılırım / İsterim" dediği ve eşleşen gizli tutkularınız burada listelenir.</span>
        </div>

        <div v-if="store.matchedFantasies.length === 0" class="empty-state pixel-card mt-3">
          <div class="empty-emoji">🔥</div>
          <p class="empty-text">Henüz ortak bir fantezi eşleşmedi!</p>
          <p class="text-xs text-muted">Ana sayfadaki "Günün Fantezisi" kartından her gün gelen fantezileri oylayarak ortak arzularınızı keşfedin.</p>
        </div>
        <div v-else class="items-list mt-3">
          <div v-for="fan in store.matchedFantasies" :key="fan.id" class="item-card fantasy-match-card pixel-card">
            <span class="item-emoji">{{ fan.emoji || '🔥' }}</span>
            <div class="item-info">
              <div class="d-flex-between">
                <h3 class="item-title">{{ fan.title }}</h3>
                <span class="badge-matched">EŞLEŞTİ 🔥</span>
              </div>
              <p class="item-desc">{{ fan.description }}</p>
              <span class="item-date">💕 Eşleşme Tarihi: {{ formatDate(fan.matchedAt) }}</span>
            </div>
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
      <div class="nav-item" @click="$router.push('/rewards')">
        <span class="nav-icon">🎁</span>
        <span class="nav-label">Ödüller</span>
      </div>
      <div class="nav-item active" @click="$router.push('/my-rewards')">
        <span class="nav-icon">📜</span>
        <span class="nav-label">Şiirler</span>
      </div>
    </nav>
  </div>
</template>

<script>
import { store } from '../store.js';

export default {
  name: 'MyRewardsView',
  data() {
    return {
      store,
      activeTab: 'rewards',
    };
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    },
  },
};
</script>

<style scoped>
.my-rewards-page {
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

.my-rewards-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tabs-container {
  display: flex;
  background: #ffffff;
  border: 3px solid var(--pixel-border);
  box-shadow: 3px 3px 0 var(--pixel-shadow);
  border-radius: 10px;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 12px 6px;
  background: transparent;
  border: none;
  font-family: var(--font-pixel);
  font-size: 0.52rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: var(--pink-soft);
  color: var(--pink);
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 30px 16px;
  background: #ffffff;
  border-radius: 14px;
}

.empty-emoji {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.items-list,
.poems-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
}

.item-emoji {
  font-size: 2.2rem;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 0.68rem;
  color: var(--pixel-border);
  margin-bottom: 4px;
}

.item-desc {
  font-size: 0.5rem;
  color: var(--text-muted);
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-date {
  font-size: 0.45rem;
  color: var(--pink);
}

.poem-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border-left: 5px solid var(--lavender);
}

.poem-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.poem-icon {
  font-size: 1.2rem;
}

.poem-title {
  font-size: 0.7rem;
  color: var(--lavender);
}

.poem-content {
  font-family: var(--font-pixel);
  font-size: 0.48rem;
  color: var(--text-main);
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 12px;
  background: #faf8fd;
  padding: 10px;
  border-radius: 6px;
}

.poem-footer {
  text-align: right;
}

.poem-date {
  font-size: 0.42rem;
  color: var(--text-muted);
}

.fantasies-intro-banner {
  background: #fff1f2;
  border-left: 4px solid #f43f5e;
  padding: 10px 14px;
  font-size: 0.54rem;
  color: #881337;
  line-height: 1.4;
}

.fantasy-match-card {
  border-left: 5px solid #f43f5e;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f6 100%);
}

.d-flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-matched {
  font-size: 0.45rem;
  background: #e11d48;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
