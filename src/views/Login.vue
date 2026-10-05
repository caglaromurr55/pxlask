<template>
  <div class="login-page">
    <div class="login-container fade-in-up">
      <!-- Logo / Başlık -->
      <div class="login-header">
        <div class="heart-pixel">💖</div>
        <h1 class="login-title">Pixel Aşk</h1>
        <p class="login-subtitle">Aşkımızın Retro Arenası</p>
      </div>

      <!-- Giriş Formu -->
      <div class="login-form pixel-card">
        <div class="form-group">
          <label class="form-label">👤 Kullanıcı Adı</label>
          <input
            v-model="username"
            class="form-input"
            type="text"
            placeholder="askim veya admin"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <label class="form-label">🔒 Şifre (6 Haneli PIN)</label>
          <input
            v-model="password"
            class="form-input"
            type="password"
            maxlength="6"
            placeholder="● ● ● ● ● ●"
            @keyup.enter="handleLogin"
            @input="onlyNumbers"
          />
          <div class="pin-dots">
            <span v-for="n in 6" :key="n" :class="['pin-dot', { filled: password.length >= n }]"></span>
          </div>
        </div>

        <button
          class="pixel-btn pixel-btn--primary login-btn"
          @click="handleLogin"
          :disabled="!isValid"
        >
          🎮 Giriş Yap
        </button>

        <!-- Test Hesapları İpucu -->
        <div class="test-hint">
          <span>💡 Giriş bilgileri: <strong>askim</strong> / <strong>123456</strong></span>
        </div>

        <transition name="fade">
          <p v-if="error" class="error-msg">⚠️ {{ error }}</p>
        </transition>
      </div>

      <!-- Kalp Süsleri -->
      <div class="login-footer">
        <span class="pixel-heart" v-for="n in 5" :key="n">❤️</span>
      </div>
    </div>
  </div>
</template>

<script>
import { login, assignRandomTasks } from '../store.js';
import { soundEngine } from '../soundEngine.js';

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },
  computed: {
    isValid() {
      return this.username.trim().length > 0 && this.password.length === 6;
    },
  },
  methods: {
    onlyNumbers() {
      this.password = this.password.replace(/\D/g, '');
    },
    async handleLogin() {
      if (!this.isValid) return;
      this.error = '';
      const result = await login(this.username, this.password);
      if (result.success) {
        soundEngine.playVictory();
        assignRandomTasks();
        this.$router.push('/');
      } else {
        soundEngine.playBonk();
        this.error = result.error;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.login-header {
  margin-bottom: 20px;
}

.heart-pixel {
  font-size: 3.2rem;
  margin-bottom: 8px;
  animation: pulseHeart 1.5s ease-in-out infinite alternate;
}

@keyframes pulseHeart {
  from { transform: scale(1); }
  to { transform: scale(1.15); }
}

.login-title {
  font-family: var(--font-pixel);
  font-size: 1.6rem;
  color: var(--pink);
  margin-bottom: 6px;
  text-shadow: 2px 2px 0px rgba(255, 94, 136, 0.2);
}

.login-subtitle {
  font-family: var(--font-pixel);
  font-size: 0.55rem;
  color: var(--text-muted);
}

.login-form {
  padding: 22px 18px;
  text-align: left;
  border-radius: 16px;
  background: #ffffff;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 0.55rem;
  color: var(--pixel-border);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  font-family: var(--font-pixel);
  font-size: 0.65rem;
  padding: 10px 12px;
  border: 3px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  border-radius: 8px;
  outline: none;
}

.form-input:focus {
  border-color: var(--pink);
}

.pin-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border: 2px solid var(--pixel-border);
  background: #f8e8ee;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.pin-dot.filled {
  background: var(--pink);
  transform: scale(1.15);
}

.login-btn {
  width: 100%;
  margin-top: 6px;
  font-size: 0.7rem;
  padding: 14px;
  border-radius: 10px;
}

.test-hint {
  margin-top: 14px;
  font-size: 0.45rem;
  color: var(--text-muted);
  text-align: center;
}

.error-msg {
  font-size: 0.55rem;
  color: var(--red);
  margin-top: 12px;
  text-align: center;
}

.login-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pixel-heart {
  font-size: 1.1rem;
}
</style>
