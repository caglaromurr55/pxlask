<template>
  <div class="home-page">
    <!-- Mobil Üst Bar -->
    <header class="home-top-bar">
      <div class="brand">
        <span class="brand-heart">💖</span>
        <span class="brand-text">Pixel Aşk</span>
      </div>
      <div class="top-bar-actions">
        <div class="pixel-badge pixel-badge--gold points-pill" :class="{ 'points-pop': pointsAnimating }">
          ⭐ {{ store.points }} Puan
        </div>
        <button v-if="store.currentUser?.role === 'admin'" class="pixel-btn admin-btn" @click="$router.push('/admin')">
          ⚙️
        </button>
        <button class="pixel-btn logout-btn" @click="handleLogout" title="Çıkış Yap">
          🚪
        </button>
      </div>
    </header>

    <!-- Ceza Bildirim Modalı (Süre Dolan Görevler / RPS Cezası) -->
    <div v-if="store.recentPenaltyAlert" class="penalty-alert-backdrop">
      <div class="penalty-alert-modal pixel-card">
        <div class="penalty-skull-icon">🚨</div>
        <h2 class="penalty-alert-title">DİKKAT: CEZA UYGULANDI!</h2>
        <p class="penalty-alert-msg">{{ store.recentPenaltyAlert.message }}</p>
        <div class="penalty-pts-badge">-{{ store.recentPenaltyAlert.totalDeducted || store.recentPenaltyAlert.pointsDeducted }} ⭐ PUAN DÜŞÜLDÜ</div>
        <button class="pixel-btn pixel-btn--primary penalty-ack-btn" @click="store.recentPenaltyAlert = null">
          Tamam, Bir Dahakine Yetiştireceğim 🥺
        </button>
      </div>
    </div>

    <!-- Ana İçerik (Mobil Akış) -->
    <main class="home-main-scroll">
      <!-- Hoş Geldin Karşılama Kartı -->
      <section class="welcome-banner pixel-card">
        <div class="welcome-text">
          <p class="welcome-sub">Hoş geldin sultanım 💕</p>
          <h1 class="welcome-title">Beni dövmeye hazır mısın?</h1>
        </div>
        <span class="welcome-emoji">🥊</span>
      </section>

      <!-- Ring Hero Card -->
      <section class="ring-hero-card pixel-card" @click="$router.push('/ring')">
        <div class="ring-preview-bg">
          <div class="preview-boyfriend">
            <img
              v-if="hasCustomAvatar"
              src="/avatar.png"
              alt="Sevgili"
              class="preview-custom-avatar"
              @error="hasCustomAvatar = false"
            />
            <span v-else class="bf-avatar">🥺</span>
            <div class="bf-tag">"Lütfen yavaş vur!"</div>
          </div>
          <div class="weapon-preview-row">
            <span class="wp-icon">👋</span>
            <span class="wp-icon">🍅</span>
            <span class="wp-icon">🩴</span>
            <span class="wp-icon">🍳</span>
            <span class="wp-icon">🔫</span>
          </div>
        </div>
        <div class="ring-hero-info">
          <div class="ring-hero-title">
            <span>🥊 BOKS RİNGİNE GİR</span>
            <span class="hero-arrow">→</span>
          </div>
          <p class="ring-hero-desc">Malzemelerini kuşan ve beni tokatla!</p>
        </div>
      </section>

      <!-- 1. ZORUNLU GÜNLÜK CİNSEL GÖREV KARTI -->
      <section class="intimate-hero-card pixel-card" v-if="store.activeIntimateTask">
        <div class="intimate-card-badge">
          <span>🔥 ZORUNLU GÜNLÜK GÖREV</span>
          <span class="intimate-timer-tag">Gece 00:00'a Kadar Zorunlu!</span>
        </div>
        <div class="intimate-body">
          <h3 class="intimate-title">{{ store.activeIntimateTask.title }}</h3>
          <p class="intimate-sub">İkinizin bu gece yatmadan önce tamamlaması gereken özel görev.</p>

          <div class="intimate-penalty-box">
            <span class="warning-icon">⚠️</span>
            <span class="warning-text">
              Eğer bu gece yapılmazsa <strong>-{{ store.activeIntimateTask.penaltyPoints || 50 }} ⭐ ceza</strong> kesilir!
              <em>({{ store.activeIntimateTask.penaltyDesc || 'Ceza masajı yapılacak' }})</em>
            </span>
          </div>

          <transition name="fade">
            <div v-if="intimateClaimToast" class="intimate-success-banner">
              {{ intimateClaimToast }}
            </div>
          </transition>

          <div class="intimate-action-row">
            <div v-if="store.activeIntimateTask.isCompleted" class="intimate-done-badge">
              ✅ Bugünün Zorunlu Görevi Yapıldı (+{{ store.activeIntimateTask.points }} ⭐)
            </div>
            <button
              v-else
              class="pixel-btn pixel-btn--primary claim-intimate-btn"
              @click="handleClaimIntimate"
            >
              💋 Görevi Tamamladık (+{{ store.activeIntimateTask.points }} ⭐)
            </button>
          </div>
        </div>
      </section>

      <!-- 2. KARAR DÜELLOSU: TAŞ - KAĞIT - MAKAS KARTI -->
      <section class="rps-hero-card pixel-card" @click="openRpsModal">
        <div class="rps-card-glow"></div>
        <div class="rps-content">
          <div class="rps-icon-row">
            <span class="rps-ico">✊</span>
            <span class="rps-ico">✋</span>
            <span class="rps-ico">✌️</span>
          </div>
          <div class="rps-text-block">
            <div class="rps-badge">⚡ ANINDA KARAR DÜELLOSU</div>
            <h2 class="rps-title">Taş - Kağıt - Makas</h2>
            <p class="rps-desc">
              Bir şeye karar veremediğinizde açın! Kaybedenin <strong>10 saniyesi</strong> var, karar vermezse ceza!
            </p>
          </div>
          <button class="pixel-btn pixel-btn--primary rps-play-btn">
            OYNA ⚔️
          </button>
        </div>
      </section>

      <!-- 3. GÜNÜN FANTEZİSİ (EŞLEŞME OYUNU) -->
      <section class="fantasy-hero-card pixel-card" v-if="todayFantasyItem">
        <div class="fantasy-card-badge">
          <span>✨ GÜNÜN FANTEZİSİ</span>
          <span class="fantasy-day-tag">Bugüne Özel</span>
        </div>
        <div class="fantasy-content">
          <div class="fantasy-header-row">
            <span class="fantasy-emoji">{{ todayFantasyItem.emoji || '🔥' }}</span>
            <h3 class="fantasy-title">{{ todayFantasyItem.title }}</h3>
          </div>
          <p class="fantasy-desc">{{ todayFantasyItem.description }}</p>

          <div class="fantasy-privacy-note">
            🤫 <em>İkinizin de oyları gizlidir. İkiniz de "Bayılırım" veya "Deneriz" derseniz eşleşir ve Sandığım'a eklenir!</em>
          </div>

          <transition name="fade">
            <div v-if="fantasyMatchAlert" class="fantasy-match-banner">
              {{ fantasyMatchAlert }}
            </div>
          </transition>

          <!-- Oylama Durumu -->
          <div v-if="myFantasyVote" class="fantasy-voted-box">
            <div class="my-vote-status">
              <span>Senin Kararın:</span>
              <strong v-if="myFantasyVote === 'love'" class="vote-tag love">🔥 Bayılırım!</strong>
              <strong v-else-if="myFantasyVote === 'maybe'" class="vote-tag maybe">🤔 Deneriz</strong>
              <strong v-else class="vote-tag pass">❌ Bana Göre Değil</strong>
            </div>

            <div v-if="isTodayFantasyMatched" class="fantasy-matched-pill">
              🎉 EŞLEŞTİNİZ! İkiniz de bu fanteziyi istediniz. Profilinizdeki "Ortak Fanteziler" listesine kaydedildi! 💕
            </div>
            <div v-else class="waiting-partner-note">
              Sevgilinin oyu bekleniyor veya yarın yeni fantezi gelecek... 🤫
            </div>
          </div>

          <div v-else class="fantasy-vote-buttons">
            <button class="pixel-btn fantasy-btn love" @click="handleVote('love')">
              🔥 Bayılırım!
            </button>
            <button class="pixel-btn fantasy-btn maybe" @click="handleVote('maybe')">
              🤔 Deneriz
            </button>
            <button class="pixel-btn fantasy-btn pass" @click="handleVote('pass')">
              ❌ Bana Göre Değil
            </button>
          </div>
        </div>
      </section>

      <!-- Puan Kazan & Görevler Açılır Panel Butonu -->
      <section class="tasks-trigger-card pixel-card" @click="openTasksDrawer('standard')">
        <div class="tasks-trigger-content">
          <div class="tasks-icon-box">🎯</div>
          <div class="tasks-info">
            <h2 class="tasks-title">Puan Kazan & Görevler</h2>
            <p class="tasks-subtitle">Sabit görevler (öpücük, sarılma), günlük ve haftalık hedefler!</p>
          </div>
          <button class="pixel-btn pixel-btn--primary open-tasks-btn">
            AÇ →
          </button>
        </div>

        <!-- Görev İlerleme Özeti (Mini Önizleme) -->
        <div class="tasks-quick-preview">
          <div class="preview-task-item preview-standard-item" @click.stop="openTasksDrawer('standard')">
            <span class="preview-badge standard">SABİT</span>
            <span class="preview-name">💋 Öpücük, Sarılma ve Sevgi Sayacı</span>
            <span class="preview-pts">Süresiz ⭐</span>
          </div>
          <div class="preview-task-item" v-if="store.assignedTasks.daily">
            <span class="preview-badge daily">GÜNLÜK</span>
            <span class="preview-name">{{ store.assignedTasks.daily.title }}</span>
            <span class="preview-pts">+{{ store.assignedTasks.daily.points }} ⭐</span>
          </div>
          <div class="preview-task-item" v-if="store.assignedTasks.weekly">
            <span class="preview-badge weekly">HAFTALIK</span>
            <span class="preview-name">{{ store.assignedTasks.weekly.title }}</span>
            <span class="preview-progress">
              {{ store.assignedTasks.weekly.currentCount || 0 }}/{{ store.assignedTasks.weekly.targetCount }}
            </span>
          </div>
        </div>
      </section>

      <!-- 4. TUTKU ODASI & OYUNLAR (KAMASUTRA, ROL YAPMA, KAZI KAZAN) -->
      <section class="passion-hero-card pixel-card" @click="openPassionDrawer('wheel')">
        <div class="passion-card-content">
          <div class="passion-icon-box">🎡</div>
          <div class="passion-text">
            <span class="passion-badge">+18 TUTKU ODASI</span>
            <h3 class="passion-title">Kamasutra Çarkı, Rol Yapma & Kazı Kazan</h3>
            <p class="passion-desc">Pozisyon çarkını çevirin, gizli senaryolar çekin veya kazı kazanla geceyi ateşleyin!</p>
          </div>
          <button class="pixel-btn pixel-btn--mint passion-btn">GİR 🔞</button>
        </div>
      </section>

      <!-- Hızlı Erişim Kartları -->
      <section class="quick-links-grid">
        <!-- Ödül Dükkanı -->
        <div class="quick-card pixel-card" @click="$router.push('/rewards')">
          <div class="quick-card-header">
            <span class="quick-card-icon">🎁</span>
            <span class="quick-card-tag">Mağaza</span>
          </div>
          <h3 class="quick-card-title">Ödüller</h3>
          <p class="quick-card-desc">Puanlarını masaj, yemek ve hediyelere harca!</p>
          <span class="quick-card-link">Göz At →</span>
        </div>

        <!-- Kazandıklarım & Şiirlerim -->
        <div class="quick-card pixel-card" @click="$router.push('/my-rewards')">
          <div class="quick-card-header">
            <span class="quick-card-icon">📜</span>
            <span class="quick-card-tag">{{ store.acquiredPoems.length }} Şiir</span>
          </div>
          <h3 class="quick-card-title">Sandığım</h3>
          <p class="quick-card-desc">Kazandığın aşk kuponları ve sana özel şiirler.</p>
          <span class="quick-card-link">Görüntüle →</span>
        </div>
      </section>

      <!-- Sevimli Aşk Notu -->
      <section class="love-note-card pixel-card">
        <span class="note-pin">📌</span>
        <p class="note-quote">"Sen bana vursan da, kalbim senin için çarpmaya devam edecek sevgilim."</p>
        <span class="note-signature">— Senin Pixel Aşkın ❤️</span>
      </section>
    </main>

    <!-- Mobil Sabit Alt Navigasyon Barı -->
    <nav class="mobile-nav-bar">
      <div class="nav-item active" @click="$router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Ana Sayfa</span>
      </div>
      <div class="nav-item" @click="$router.push('/ring')">
        <span class="nav-icon">🥊</span>
        <span class="nav-label">Ring</span>
      </div>
      <div class="nav-item" @click="openTasksDrawer('standard')">
        <span class="nav-icon">🎯</span>
        <span class="nav-label">Görevler</span>
      </div>
      <div class="nav-item" @click="$router.push('/rewards')">
        <span class="nav-icon">🎁</span>
        <span class="nav-label">Ödüller</span>
      </div>
      <div class="nav-item" @click="$router.push('/my-rewards')">
        <span class="nav-icon">📜</span>
        <span class="nav-label">Şiirler</span>
      </div>
    </nav>

    <!-- ============================================
         AÇILIR PANEL: PUAN KAZAN & GÖREVLER (DRAWER)
         ============================================ -->
    <div v-if="showTasksDrawer" class="drawer-backdrop" @click="showTasksDrawer = false">
      <div class="drawer-container" @click.stop>
        <!-- Panel Başlığı -->
        <div class="drawer-header">
          <div class="drawer-title">
            <span>🎯 Puan Kazan & Görevler</span>
          </div>
          <button class="drawer-close" @click="showTasksDrawer = false">✕</button>
        </div>

        <!-- Panel Sekmeleri (Sabit, Günlük, Haftalık, Aylık) -->
        <div class="drawer-tabs">
          <button
            class="drawer-tab"
            :class="{ 'active': activeTaskTab === 'standard' }"
            @click="activeTaskTab = 'standard'"
          >
            ♾️ Sabit Aşk
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeTaskTab === 'daily' }"
            @click="activeTaskTab = 'daily'"
          >
            📅 Günlük
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeTaskTab === 'weekly' }"
            @click="activeTaskTab = 'weekly'"
          >
            📆 Haftalık
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeTaskTab === 'monthly' }"
            @click="activeTaskTab = 'monthly'"
          >
            🗓️ Aylık
          </button>
        </div>

        <!-- Panel İçeriği -->
        <div class="drawer-body">
          <!-- 0. STANDART / SÜRESİZ GÖREVLER (SABİT EYLEMLER & SAYI GİRİŞİ) -->
          <div v-if="activeTaskTab === 'standard'" class="task-tab-content">
            <div class="tab-notice standard-notice">
              <span>💖 <strong>Süresiz Sabit Görevler:</strong> Sevgilini öptükçe, sarıldıkça adet sayısını girip <strong>ANINDA</strong> puanını alabilirsin! Zaman sınırı yok.</span>
            </div>

            <!-- Başarı Bildirimi Bannerı -->
            <transition name="fade">
              <div v-if="standardClaimToast" class="standard-toast-banner pixel-card">
                {{ standardClaimToast }}
              </div>
            </transition>

            <div class="standard-task-list">
              <div
                v-for="task in store.standardTasks"
                :key="task.id"
                class="standard-task-card pixel-card"
              >
                <div class="task-card-top">
                  <div class="standard-title-row">
                    <span class="standard-emoji">{{ task.emoji }}</span>
                    <div>
                      <h3 class="standard-name">{{ task.title }}</h3>
                      <p class="standard-desc">{{ task.description }}</p>
                    </div>
                  </div>
                  <span class="badge-type standard">+{{ task.pointsPerUnit }} ⭐ / {{ task.unit }}</span>
                </div>

                <!-- Sayı Girişi, Hızlı Ekleme ve Puan Alma Kutusu -->
                <div class="standard-input-block">
                  <div class="standard-calc-preview">
                    <span>Girilen: <strong>{{ getStandardCount(task.id) }} {{ task.unit }}</strong></span>
                    <span class="pts-calc-tag">Kazanılacak: +{{ calcStandardPoints(task) }} ⭐</span>
                  </div>

                  <!-- Hızlı Butonlar -->
                  <div class="quick-add-buttons">
                    <button class="pixel-btn quick-btn" @click="setStandardCount(task.id, 1)">1</button>
                    <button class="pixel-btn quick-btn" @click="addStandardCount(task.id, 5)">+5</button>
                    <button class="pixel-btn quick-btn" @click="addStandardCount(task.id, 10)">+10</button>
                    <button class="pixel-btn quick-btn" @click="addStandardCount(task.id, 20)">+20</button>
                  </div>

                  <!-- Özel Sayı Girişi ve Puanı Al Butonu -->
                  <div class="custom-input-row">
                    <input
                      type="number"
                      :value="getStandardCount(task.id)"
                      @input="setStandardCount(task.id, $event.target.value)"
                      class="pixel-num-input"
                      placeholder="Kaç kez?"
                      min="1"
                    />
                    <button
                      class="pixel-btn pixel-btn--primary claim-standard-btn"
                      @click="handleClaimStandard(task)"
                    >
                      🎁 +{{ calcStandardPoints(task) }} ⭐ Puanı Al
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 1. GÜNLÜK GÖREV SEKME İÇERİĞİ -->
          <div v-if="activeTaskTab === 'daily'" class="task-tab-content">
            <div class="tab-notice">
              <span>💡 Günlük görevler her gece saat 00:00'da otomatik yenilenir.</span>
            </div>

            <!-- Günlük Görev Bugün Zaten Yapıldıysa Kilitli Göster -->
            <div v-if="isDailyClaimedToday" class="daily-locked-card pixel-card">
              <span class="locked-icon">🔒</span>
              <h3 class="locked-title">Bugünkü Görevini Tamamladın!</h3>
              <p class="locked-desc">
                Art arda günlük görev yapamazsın sevgilim. Yeni günlük görev bu gece <strong>saat 00:00'dan sonra</strong> açılacaktır.
              </p>
              <div class="locked-timer-badge">
                <span class="timer-label">Yeni Göreve Kalan Süre:</span>
                <span class="timer-countdown">⏳ {{ midnightCountdownText }}</span>
              </div>
            </div>

            <!-- Henüz Yapılmamış Günlük Görev Varsa -->
            <div v-else-if="store.assignedTasks.daily" class="task-active-card pixel-card">
              <div class="task-card-top">
                <span class="badge-type daily">GÜNLÜK GÖREV</span>
                <span class="task-reward-pts">+{{ store.assignedTasks.daily.points }} ⭐</span>
              </div>
              <h3 class="task-main-title">{{ store.assignedTasks.daily.title }}</h3>
              
              <div class="task-penalty-warning">
                ⚠️ <strong>Zaman Sınırı:</strong> Bu görev bu gece saat 00:00'a kadar yapılmazsa, kazandıracağı <strong>-{{ store.assignedTasks.daily.points }} ⭐ puan ceza</strong> olarak düşecektir!
              </div>

              <p class="task-hint">Görevi yerine getirdiğinde aşağıdaki butona basarak puanını alabilirsin!</p>

              <button
                class="pixel-btn pixel-btn--primary claim-task-btn"
                @click="claimTask('daily')"
              >
                ✅ Görevi Yaptım (+{{ store.assignedTasks.daily.points }} ⭐)
              </button>
            </div>
            <div v-else class="empty-task-card pixel-card">
              <p>Tüm günlük görevleri tamamladın! Bu gece saat 12'den sonra yeni görev gelecek.</p>
            </div>
          </div>

          <!-- 2. HAFTALIK GÖREV SEKME İÇERİĞİ (İlerleme Barlı & Sayı Girişli) -->
          <div v-if="activeTaskTab === 'weekly'" class="task-tab-content">
            <div class="tab-notice">
              <span>📊 Haftalık görevlerde yaptıkça sayı girip barı doldurabilirsin!</span>
            </div>

            <div v-if="store.assignedTasks.weekly" class="task-active-card pixel-card">
              <div class="task-card-top">
                <span class="badge-type weekly">HAFTALIK GÖREV</span>
                <span class="task-reward-pts">+{{ store.assignedTasks.weekly.points }} ⭐</span>
              </div>
              <h3 class="task-main-title">{{ store.assignedTasks.weekly.title }}</h3>

              <div class="task-penalty-warning">
                ⚠️ <strong>Haftalık Sıfırlanma:</strong> Haftalık görevler Pazar gecesi 00:00'da sıfırlanır. Hedefe ulaşılmazsa <strong>-{{ store.assignedTasks.weekly.points }} ⭐ puan ceza</strong> kesilir!
              </div>

              <!-- İlerleme Barı -->
              <div class="progress-wrap">
                <div class="progress-container">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: getTaskProgressPercent('weekly') + '%' }"
                  ></div>
                  <span class="progress-text">
                    {{ store.assignedTasks.weekly.currentCount || 0 }} / {{ store.assignedTasks.weekly.targetCount }} {{ store.assignedTasks.weekly.unit }} (%{{ getTaskProgressPercent('weekly') }})
                  </span>
                </div>
              </div>

              <!-- Sayı Ekleme / Veri Girişi Alanı -->
              <div class="counter-input-section" v-if="!isWeeklyCompleted">
                <p class="counter-label">Yaptıkça ekle:</p>
                <div class="quick-add-buttons">
                  <button class="pixel-btn quick-btn" @click="incrementProgress('weekly', 1)">+1</button>
                  <button class="pixel-btn quick-btn" @click="incrementProgress('weekly', 5)">+5</button>
                  <button class="pixel-btn quick-btn" @click="incrementProgress('weekly', 10)">+10</button>
                </div>

                <div class="custom-input-row">
                  <input
                    type="number"
                    v-model.number="weeklyInputVal"
                    class="pixel-num-input"
                    placeholder="Adet gir..."
                    min="1"
                  />
                  <button class="pixel-btn pixel-btn--mint" @click="addCustomProgress('weekly')">
                    ➕ Ekle
                  </button>
                </div>
              </div>

              <!-- Tamamlama Butonu (Bar dolduğunda aktifleşir) -->
              <div class="claim-area" v-if="isWeeklyCompleted">
                <div class="celebrate-badge">🎉 Hedefe Ulaştın!</div>
                <button
                  class="pixel-btn pixel-btn--primary claim-task-btn ready-glow"
                  @click="claimTask('weekly')"
                >
                  🏆 Ödülü Al (+{{ store.assignedTasks.weekly.points }} ⭐)
                </button>
              </div>
            </div>
            <div v-else class="empty-task-card pixel-card">
              <p>Haftalık görev tamamlandı!</p>
            </div>
          </div>

          <!-- 3. AYLIK GÖREV SEKME İÇERİĞİ (İlerleme Barlı & Sayı Girişli) -->
          <div v-if="activeTaskTab === 'monthly'" class="task-tab-content">
            <div class="tab-notice">
              <span>💖 Sevgilini öptükçe veya sarıldıkça buraya gir, barı tamamla!</span>
            </div>

            <div v-if="store.assignedTasks.monthly" class="task-active-card pixel-card">
              <div class="task-card-top">
                <span class="badge-type monthly">AYLIK GÖREV</span>
                <span class="task-reward-pts">+{{ store.assignedTasks.monthly.points }} ⭐</span>
              </div>
              <h3 class="task-main-title">{{ store.assignedTasks.monthly.title }}</h3>

              <div class="task-penalty-warning">
                ⚠️ <strong>Aylık Sıfırlanma:</strong> Aylık görev bir sonraki ayın 1'ine girildiği anda sona erer. Tamamlanmazsa <strong>-{{ store.assignedTasks.monthly.points }} ⭐ puan ceza</strong> kesilir!
              </div>

              <!-- İlerleme Barı -->
              <div class="progress-wrap">
                <div class="progress-container">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: getTaskProgressPercent('monthly') + '%' }"
                  ></div>
                  <span class="progress-text">
                    {{ store.assignedTasks.monthly.currentCount || 0 }} / {{ store.assignedTasks.monthly.targetCount }} {{ store.assignedTasks.monthly.unit }} (%{{ getTaskProgressPercent('monthly') }})
                  </span>
                </div>
              </div>

              <!-- Sayı Ekleme / Veri Girişi Alanı -->
              <div class="counter-input-section" v-if="!isMonthlyCompleted">
                <p class="counter-label">Her öptüğünde buraya ekle:</p>
                <div class="quick-add-buttons">
                  <button class="pixel-btn quick-btn" @click="incrementProgress('monthly', 1)">+1</button>
                  <button class="pixel-btn quick-btn" @click="incrementProgress('monthly', 10)">+10</button>
                  <button class="pixel-btn quick-btn" @click="incrementProgress('monthly', 50)">+50</button>
                  <button class="pixel-btn quick-btn" @click="incrementProgress('monthly', 100)">+100</button>
                </div>

                <div class="custom-input-row">
                  <input
                    type="number"
                    v-model.number="monthlyInputVal"
                    class="pixel-num-input"
                    placeholder="Sayı gir..."
                    min="1"
                  />
                  <button class="pixel-btn pixel-btn--mint" @click="addCustomProgress('monthly')">
                    ➕ Ekle
                  </button>
                </div>
              </div>

              <!-- Tamamlama Butonu (Bar dolduğunda aktifleşir) -->
              <div class="claim-area" v-if="isMonthlyCompleted">
                <div class="celebrate-badge">🎉 1000 Kere Öptün! Muhteşemsin!</div>
                <button
                  class="pixel-btn pixel-btn--primary claim-task-btn ready-glow"
                  @click="claimTask('monthly')"
                >
                  👑 Büyük Ödülü Al (+{{ store.assignedTasks.monthly.points }} ⭐)
                </button>
              </div>
            </div>
            <div v-else class="empty-task-card pixel-card">
              <p>Aylık görev tamamlandı!</p>
            </div>
          </div>

          <!-- Bonus Puan Kazanma İpuçları -->
          <div class="bonus-point-section pixel-card">
            <h4 class="bonus-title">✨ Diğer Puan Kazanma Yolları</h4>
            <div class="bonus-item" v-for="pa in store.pointActions" :key="pa.id">
              <span class="bonus-emoji">{{ pa.emoji }}</span>
              <span class="bonus-desc">{{ pa.title }}</span>
              <span class="bonus-pts">{{ pa.points }} ⭐</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================
         MODAL: TAŞ - KAĞIT - MAKAS DÜELLOSU
         ============================================ -->
    <div v-if="showRpsModal" class="drawer-backdrop" @click="closeRpsModal">
      <div class="rps-modal-box pixel-card" @click.stop>
        <div class="rps-modal-head">
          <h2 class="rps-modal-title">⚔️ Karar Düellosu</h2>
          <button class="drawer-close" @click="closeRpsModal">✕</button>
        </div>

        <div class="rps-modal-body">
          <!-- 1. AŞAMA: 1. Oyuncu (Aşkım) Seçimi -->
          <div v-if="rpsStep === 'p1'" class="rps-phase-box">
            <span class="rps-player-badge">1. OYUNCU (Aşkım 💕)</span>
            <p class="rps-phase-prompt">Sevgilin bakmıyorken gizlice hamleni seç!</p>
            <div class="rps-choices-grid">
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP1('rock')">
                <span class="rc-emoji">✊</span>
                <span class="rc-label">TAŞ</span>
              </button>
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP1('paper')">
                <span class="rc-emoji">✋</span>
                <span class="rc-label">KAĞIT</span>
              </button>
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP1('scissors')">
                <span class="rc-emoji">✌️</span>
                <span class="rc-label">MAKAS</span>
              </button>
            </div>
          </div>

          <!-- 2. AŞAMA: 2. Oyuncu (Sevgilim) Seçimi -->
          <div v-if="rpsStep === 'p2'" class="rps-phase-box">
            <span class="rps-player-badge player-2">2. OYUNCU (Sevgilim 👑)</span>
            <p class="rps-phase-prompt">Şimdi telefonu sevgiline ver, kendi hamlesini seçsin!</p>
            <div class="rps-choices-grid">
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP2('rock')">
                <span class="rc-emoji">✊</span>
                <span class="rc-label">TAŞ</span>
              </button>
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP2('paper')">
                <span class="rc-emoji">✋</span>
                <span class="rc-label">KAĞIT</span>
              </button>
              <button class="pixel-btn rps-choice-btn" @click="handleRpsSelectP2('scissors')">
                <span class="rc-emoji">✌️</span>
                <span class="rc-label">MAKAS</span>
              </button>
            </div>
          </div>

          <!-- 3. AŞAMA: SONUÇ & 10 SANİYE GERİ SAYIM SAYACI -->
          <div v-if="rpsStep === 'result'" class="rps-phase-box rps-result-phase">
            <div class="rps-versus-row">
              <div class="rps-player-result">
                <span class="player-name">Aşkım</span>
                <span class="choice-big">{{ getRpsEmoji(store.rpsDuel.player1Choice) }}</span>
              </div>
              <span class="vs-text">VS</span>
              <div class="rps-player-result">
                <span class="player-name">Sevgilim</span>
                <span class="choice-big">{{ getRpsEmoji(store.rpsDuel.player2Choice) }}</span>
              </div>
            </div>

            <!-- Berabere Durumu -->
            <div v-if="store.rpsDuel.status === 'tie'" class="rps-tie-box">
              <h3 class="tie-title">🤝 BERABERE!</h3>
              <p class="tie-desc">İkiniz de aynı hamleyi yaptınız. Hemen tekrar deneyin!</p>
              <button class="pixel-btn pixel-btn--primary mt-3" @click="handleRestartRps">
                🔄 Tekrar Oyna
              </button>
            </div>

            <!-- Kazanan & Kaybeden Durumu -->
            <div v-else class="rps-outcome-box">
              <div class="winner-banner">
                🏆 Kazanan: <strong>{{ store.rpsDuel.winner === 'askim' ? 'Aşkım 💕' : 'Sevgilim 👑' }}</strong>
              </div>
              <div class="loser-banner">
                💀 Kaybeden: <strong>{{ store.rpsDuel.loser === 'askim' ? 'Aşkım' : 'Sevgilim' }}</strong>
              </div>

              <!-- 10 Saniye Geri Sayım & Karar Verdim Butonu -->
              <div v-if="store.rpsDuel.status === 'countdown'" class="rps-countdown-block">
                <div class="countdown-warning-badge">⚠️ 10 SANİYEN VAR!</div>
                <div class="countdown-clock-pulse">
                  ⏳ {{ rpsRemainingSeconds }}
                </div>
                <p class="countdown-instruction">
                  Kaybeden hemen kararını sesli söylesin ve süre dolmadan butona bassın!
                </p>
                <button
                  class="pixel-btn pixel-btn--mint confirm-decision-btn"
                  @click="handleConfirmDecision"
                >
                  ✅ 10 Saniye Dolmadan KARAR VERDİM!
                </button>
              </div>

              <!-- Karar Zamanında Verildi -->
              <div v-else-if="store.rpsDuel.status === 'decided'" class="rps-decided-box">
                <div class="decided-badge">🎉 KARAR VERİLDİ!</div>
                <p class="decided-desc">Harika! Kararını 10 saniye dolmadan verdin ve ceza almaktan kurtuldun.</p>
                <button class="pixel-btn pixel-btn--primary mt-3" @click="handleRestartRps">
                  🔄 Yeni Düello
                </button>
              </div>

              <!-- Süre Doldu ve Ceza Kesildi -->
              <div v-else-if="store.rpsDuel.status === 'penalized'" class="rps-penalized-box">
                <div class="penalized-badge">🚨 SÜRE DOLDU! CEZA UYGULANDI!</div>
                <div class="penalized-pts">-{{ store.rpsDuel.penaltyPoints }} ⭐ PUAN KESİLDİ!</div>
                <p class="penalized-desc"><strong>Ceza:</strong> {{ store.rpsDuel.penaltyDesc }}</p>
                <button class="pixel-btn pixel-btn--primary mt-3" @click="handleRestartRps">
                  🔄 Yeni Düello
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================
         AÇILIR PANEL: +18 TUTKU ODASI (KAMASUTRA, ROL YAPMA, KAZI KAZAN, ZARLAR)
         ============================================ -->
    <div v-if="showGamesDrawer" class="drawer-backdrop" @click="showGamesDrawer = false">
      <div class="drawer-container" @click.stop>
        <div class="drawer-header">
          <div class="drawer-title">
            <span>🔞 +18 Tutku Odası</span>
          </div>
          <button class="drawer-close" @click="showGamesDrawer = false">✕</button>
        </div>

        <div class="drawer-tabs passion-drawer-tabs">
          <button
            class="drawer-tab"
            :class="{ 'active': activeGameTab === 'wheel' }"
            @click="activeGameTab = 'wheel'"
          >
            🎡 Pozisyon Çarkı
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeGameTab === 'roleplay' }"
            @click="activeGameTab = 'roleplay'"
          >
            🎭 Rol Yapma
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeGameTab === 'scratch' }"
            @click="activeGameTab = 'scratch'"
          >
            🎫 Kazı Kazan
          </button>
          <button
            class="drawer-tab"
            :class="{ 'active': activeGameTab === 'dice' }"
            @click="activeGameTab = 'dice'"
          >
            🎲 Tutku Zarları
          </button>
        </div>

        <div class="drawer-body">
          <!-- 1. SEKME: KAMASUTRA POZİSYON ÇARKI -->
          <div v-if="activeGameTab === 'wheel'" class="game-tab-content">
            <div class="tab-notice">
              <span>🎡 Çarkı çevirerek bu gece deneyeceğiniz pozisyonu ve aşk ipuçlarını keşfedin! (Puan ve ceza bağımsızdır)</span>
            </div>

            <!-- Çark Alanı -->
            <div class="wheel-stage-card pixel-card">
              <div class="wheel-viewport">
                <div class="wheel-pointer">🔻</div>
                <div
                  class="kamasutra-wheel"
                  :style="{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinningWheel ? 'transform 2.8s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none'
                  }"
                >
                  <div
                    v-for="(pos, idx) in store.kamasutraPositions"
                    :key="pos.id"
                    class="wheel-slice"
                    :style="{
                      transform: `rotate(${(360 / store.kamasutraPositions.length) * idx}deg)`
                    }"
                  >
                    <span class="slice-emoji">{{ pos.emoji }}</span>
                    <span class="slice-label">{{ pos.title.split(' ')[0] }}</span>
                  </div>
                  <div class="wheel-center-hub">💕</div>
                </div>
              </div>

              <button
                class="pixel-btn pixel-btn--primary spin-wheel-btn"
                :disabled="isSpinningWheel"
                @click="spinKamasutraWheel"
              >
                {{ isSpinningWheel ? '🌀 Çark Dönüyor...' : '🎡 ÇARKI ÇEVİR!' }}
              </button>
            </div>

            <!-- Seçilen / Gelen Pozisyon Detay Kartı -->
            <div v-if="selectedPosition" class="position-detail-card pixel-card">
              <div class="pos-card-head">
                <span class="pos-big-emoji">{{ selectedPosition.emoji }}</span>
                <div>
                  <h3 class="pos-title">{{ selectedPosition.title }}</h3>
                  <div class="pos-meta-tags">
                    <span class="pos-badge pos-cat">{{ selectedPosition.category }}</span>
                    <span class="pos-badge pos-diff">{{ selectedPosition.difficulty }}</span>
                  </div>
                </div>
              </div>

              <div class="pos-card-body">
                <p class="pos-desc-text">{{ selectedPosition.description }}</p>
                <div class="pos-tip-box" v-if="selectedPosition.tip">
                  💡 <strong>Tutku İpucu:</strong> {{ selectedPosition.tip }}
                </div>
              </div>
            </div>
          </div>

          <!-- 2. SEKME: GİZLİ ROL YAPMA (ROLEPLAY) KARTLARI -->
          <div v-if="activeGameTab === 'roleplay'" class="game-tab-content">
            <div class="tab-notice">
              <span>🎭 Gizli bir kimliğe bürünün! Çektiğiniz karttaki ortamı, partner rollerini ve kuralları uygulayın.</span>
            </div>

            <div class="roleplay-deck-stage pixel-card">
              <div class="deck-visual-stack" :class="{ 'animating': isDrawingRoleplay }">
                <div class="deck-shadow-card"></div>
                <div class="deck-shadow-card card-2"></div>
                <div class="deck-top-card">
                  <span class="deck-icon">🎭</span>
                  <span class="deck-title">GİZLİ SENARYO DESTESİ</span>
                </div>
              </div>

              <button
                class="pixel-btn pixel-btn--mint draw-scenario-btn"
                :disabled="isDrawingRoleplay"
                @click="drawRoleplayCard"
              >
                {{ isDrawingRoleplay ? '🃏 Senaryo Çekiliyor...' : '🃏 GİZLİ SENARYO ÇEK' }}
              </button>
            </div>

            <!-- Çekilen Senaryo Kartı -->
            <div v-if="selectedRoleplayCard" class="roleplay-result-card pixel-card">
              <div class="rp-head">
                <span class="rp-emoji">{{ selectedRoleplayCard.emoji }}</span>
                <div>
                  <h3 class="rp-title">{{ selectedRoleplayCard.title }}</h3>
                  <div class="rp-setting-pill">📍 {{ selectedRoleplayCard.setting }}</div>
                </div>
              </div>

              <div class="rp-body">
                <!-- Roller -->
                <div class="rp-roles-grid">
                  <div class="rp-role-box partner-1">
                    <span class="role-who">👤 1. Partner Rolü</span>
                    <p class="role-what">{{ selectedRoleplayCard.partner1Role }}</p>
                  </div>
                  <div class="rp-role-box partner-2">
                    <span class="role-who">👤 2. Partner Rolü</span>
                    <p class="role-what">{{ selectedRoleplayCard.partner2Role }}</p>
                  </div>
                </div>

                <!-- Kurallar & Atmosfer -->
                <div class="rp-rules-box" v-if="selectedRoleplayCard.rules">
                  <span class="rules-label">⚠️ Altın Kurallar:</span>
                  <p class="rules-text">{{ selectedRoleplayCard.rules }}</p>
                </div>

                <div class="rp-desc-box" v-if="selectedRoleplayCard.description">
                  <span class="desc-label">💫 Atmosfer & Detay:</span>
                  <p class="desc-text">{{ selectedRoleplayCard.description }}</p>
                </div>
              </div>

              <div class="rp-card-footer">
                <button class="pixel-btn pixel-btn--primary btn-sm" @click="drawRoleplayCard">
                  🔄 Başka Senaryo Çek
                </button>
              </div>
            </div>
          </div>

          <!-- 3. SEKME: YARAMAZ KAZI KAZAN (GİRİŞTE 1 HAK) -->
          <div v-if="activeGameTab === 'scratch'" class="game-tab-content">
            <!-- Oturum Kazıma Hakkı Durumu -->
            <div
              class="scratch-status-banner"
              :class="store.canScratchInCurrentSession ? 'ready' : 'used'"
            >
              <div v-if="store.canScratchInCurrentSession">
                🎟️ <strong>1 Kazıma Hakkın Var!</strong> Aşağıdaki kartlardan birine dokunarak gizli sürprizi kazı!
              </div>
              <div v-else>
                🔒 <strong>Bu Girişteki 1 Kazıma Hakkını Kullandın!</strong> Yeni bir sürpriz açmak için odaya tekrar gir.
              </div>
            </div>

            <transition name="fade">
              <div v-if="scratchToast" class="scratch-toast-alert">
                {{ scratchToast }}
              </div>
            </transition>

            <div class="scratch-grid">
              <div
                v-for="card in store.scratchCards"
                :key="card.id"
                class="scratch-card pixel-card"
                :class="{ 'scratched': card.isScratched, 'disabled-scratch': !store.canScratchInCurrentSession && !card.isScratched }"
                @click="handleScratch(card.id)"
              >
                <div v-if="!card.isScratched" class="scratch-foil">
                  <span class="foil-icon">❓</span>
                  <span class="foil-hint">{{ card.hint || 'DOKUN & KAZI' }}</span>
                </div>
                <div v-else class="scratch-revealed">
                  <span class="scratched-tag">SÜRPRİZ AÇILDI!</span>
                  <div class="revealed-emoji">{{ card.emoji || '🎁' }}</div>
                  <h4 class="revealed-title">{{ card.title }}</h4>
                  <p class="revealed-desc">{{ card.content || card.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. SEKME: TUTKU ZARLARI -->
          <div v-if="activeGameTab === 'dice'" class="game-tab-content">
            <div class="tab-notice">
              <span>🎲 Zarları atın; hangi eylemi, hangi bölgeye, ne kadar süre yapacağınızı kader belirlesin!</span>
            </div>

            <div class="dice-arena pixel-card">
              <div class="dice-row">
                <div class="die-card">
                  <span class="die-label">EYLEM</span>
                  <span class="die-val">{{ store.tutkuZarlari.lastRoll ? store.tutkuZarlari.lastRoll.action : '💋 Öp' }}</span>
                </div>
                <div class="die-card">
                  <span class="die-label">BÖLGE</span>
                  <span class="die-val">{{ store.tutkuZarlari.lastRoll ? store.tutkuZarlari.lastRoll.body : 'Boyun' }}</span>
                </div>
                <div class="die-card">
                  <span class="die-label">SÜRE</span>
                  <span class="die-val">{{ store.tutkuZarlari.lastRoll ? store.tutkuZarlari.lastRoll.duration : '1 Dakika' }}</span>
                </div>
              </div>

              <button class="pixel-btn pixel-btn--primary roll-dice-btn" @click="handleRollDice">
                🎲 ZARLARI AT!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Puan Kazanma Uçan Bildirimi -->
    <transition name="fade">
      <div v-if="pointsPopup" class="points-reward-popup">
        +{{ pointsPopupAmount }} ⭐ KAZANDIN!
      </div>
    </transition>
  </div>
</template>

<script>
import {
  store,
  completeTask,
  logout,
  assignRandomTasks,
  updateTaskProgress,
  claimStandardTask,
  claimIntimateTask,
  getTodayFantasy,
  voteDailyFantasy,
  makeRpsChoice,
  confirmRpsDecision,
  applyRpsPenalty,
  resetRpsDuel,
  rollTutkuZarlari,
  openPassionRoom,
  scratchCard,
  getTodayDateStr
} from '../store.js';
import { soundEngine } from '../soundEngine.js';

export default {
  name: 'Home',
  data() {
    return {
      store,
      showTasksDrawer: false,
      activeTaskTab: 'standard', // Standart görevler ilk sekmede açılsın
      standardInputs: {},        // { [taskId]: number }
      standardClaimToast: null,
      weeklyInputVal: '',
      monthlyInputVal: '',
      pointsAnimating: false,
      pointsPopup: false,
      pointsPopupAmount: 0,
      hasCustomAvatar: false,

      // Cinsel Görev & Fantezi State
      intimateClaimToast: null,
      fantasyMatchAlert: null,

      // Taş - Kağıt - Makas Düellosu State
      showRpsModal: false,
      rpsLocalChoiceP1: null,
      rpsLocalChoiceP2: null,
      rpsStep: 'p1', // 'p1' | 'p2' | 'result'
      rpsTimerInterval: null,
      rpsRemainingSeconds: 10,

      // Tutku Odası (+18 Oyunlar)
      showGamesDrawer: false,
      activeGameTab: 'wheel', // 'wheel' | 'roleplay' | 'scratch' | 'dice'
      isSpinningWheel: false,
      wheelRotation: 0,
      selectedPosition: null,
      isDrawingRoleplay: false,
      selectedRoleplayCard: null,
      scratchToast: null,

      // Gece 12 Geri Sayımı
      midnightCountdownText: '',
      countdownInterval: null,
    };
  },
  computed: {
    todayDate() {
      return getTodayDateStr();
    },
    isDailyClaimedToday() {
      return store.dailyTaskClaimedDate === getTodayDateStr();
    },
    isWeeklyCompleted() {
      const task = store.assignedTasks.weekly;
      return task && (task.currentCount || 0) >= task.targetCount;
    },
    isMonthlyCompleted() {
      const task = store.assignedTasks.monthly;
      return task && (task.currentCount || 0) >= task.targetCount;
    },
    todayFantasyItem() {
      return getTodayFantasy();
    },
    myFantasyVote() {
      const fan = this.todayFantasyItem;
      if (!fan) return null;
      const u = store.currentUser?.username || 'askim';
      return store.fantasyVotes[fan.id]?.[u] || null;
    },
    isTodayFantasyMatched() {
      const fan = this.todayFantasyItem;
      if (!fan) return false;
      return store.matchedFantasies.some(m => m.id === fan.id);
    }
  },
  created() {
    assignRandomTasks();
    this.updateMidnightCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateMidnightCountdown();
    }, 1000);

    const img = new Image();
    img.onload = () => { this.hasCustomAvatar = true; };
    img.onerror = () => { this.hasCustomAvatar = false; };
    img.src = '/avatar.png';
  },
  beforeUnmount() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.rpsTimerInterval) clearInterval(this.rpsTimerInterval);
  },
  methods: {
    handleLogout() {
      logout();
      this.$router.push('/login');
    },
    openTasksDrawer(tab = 'standard') {
      this.activeTaskTab = tab;
      this.showTasksDrawer = true;
      soundEngine.playCoin();
    },

    // Standart Görevler
    getStandardCount(taskId) {
      if (this.standardInputs[taskId] === undefined) {
        this.standardInputs[taskId] = 1;
      }
      return this.standardInputs[taskId];
    },
    setStandardCount(taskId, val) {
      this.standardInputs[taskId] = Math.max(1, parseInt(val, 10) || 1);
    },
    addStandardCount(taskId, delta) {
      const current = this.getStandardCount(taskId);
      this.standardInputs[taskId] = Math.max(1, current + delta);
    },
    calcStandardPoints(task) {
      const count = this.getStandardCount(task.id);
      return count * (task.pointsPerUnit || 1);
    },
    async handleClaimStandard(task) {
      const count = this.getStandardCount(task.id);
      const res = await claimStandardTask(task.id, count);
      if (res.success) {
        soundEngine.playCoin();
        soundEngine.playVictory();
        this.triggerPointsAnim(res.pointsEarned);
        this.standardClaimToast = `🎉 Harikasın! ${res.count} ${res.unit} için +${res.pointsEarned} ⭐ kazandın!`;
        this.standardInputs[task.id] = 1;
        setTimeout(() => {
          this.standardClaimToast = null;
        }, 3500);
      }
    },

    // Zorunlu Cinsel Görev
    handleClaimIntimate() {
      const res = claimIntimateTask();
      if (res.success) {
        soundEngine.playVictory();
        this.triggerPointsAnim(res.pointsAwarded);
        this.intimateClaimToast = `🎉 Harikasınız! Zorunlu görev tamamlandı (+${res.pointsAwarded} ⭐)`;
        setTimeout(() => { this.intimateClaimToast = null; }, 3500);
      }
    },

    // Günün Fantezisi Oylama
    handleVote(vote) {
      const fan = this.todayFantasyItem;
      if (!fan) return;
      const res = voteDailyFantasy(fan.id, vote);
      if (res.isMatch) {
        soundEngine.playFanfare();
        this.fantasyMatchAlert = `🔥 EŞLEŞME! İkiniz de "${fan.title}" fantezisine EVET dediniz! Sandığım sekmesine eklendi 💕`;
      } else {
        soundEngine.playCoin();
      }
    },

    // Taş - Kağıt - Makas Düellosu
    openRpsModal() {
      this.showRpsModal = true;
      this.rpsLocalChoiceP1 = null;
      this.rpsLocalChoiceP2 = null;
      this.rpsStep = 'p1';
      resetRpsDuel();
      soundEngine.playCoin();
    },
    handleRpsSelectP1(choice) {
      this.rpsLocalChoiceP1 = choice;
      soundEngine.playBonk();
      this.rpsStep = 'p2';
    },
    handleRpsSelectP2(choice) {
      this.rpsLocalChoiceP2 = choice;
      soundEngine.playBonk();
      makeRpsChoice('askim', this.rpsLocalChoiceP1);
      const res = makeRpsChoice('admin', this.rpsLocalChoiceP2);
      this.rpsStep = 'result';

      if (res.status === 'countdown') {
        this.startRpsTimer();
      }
    },
    startRpsTimer() {
      if (this.rpsTimerInterval) clearInterval(this.rpsTimerInterval);
      this.rpsRemainingSeconds = 10;
      soundEngine.playTick();

      this.rpsTimerInterval = setInterval(() => {
        this.rpsRemainingSeconds--;
        if (this.rpsRemainingSeconds > 0) {
          soundEngine.playTick();
        } else {
          clearInterval(this.rpsTimerInterval);
          this.rpsTimerInterval = null;
          soundEngine.playBuzzer();
          applyRpsPenalty();
        }
      }, 1000);
    },
    handleConfirmDecision() {
      if (this.rpsTimerInterval) {
        clearInterval(this.rpsTimerInterval);
        this.rpsTimerInterval = null;
      }
      soundEngine.playVictory();
      confirmRpsDecision();
    },
    handleRestartRps() {
      if (this.rpsTimerInterval) {
        clearInterval(this.rpsTimerInterval);
        this.rpsTimerInterval = null;
      }
      this.rpsLocalChoiceP1 = null;
      this.rpsLocalChoiceP2 = null;
      this.rpsStep = 'p1';
      resetRpsDuel();
    },
    getRpsEmoji(choice) {
      if (choice === 'rock') return '✊ Taş';
      if (choice === 'paper') return '✋ Kağıt';
      if (choice === 'scissors') return '✌️ Makas';
      return '❓';
    },
    closeRpsModal() {
      if (this.rpsTimerInterval) {
        clearInterval(this.rpsTimerInterval);
        this.rpsTimerInterval = null;
      }
      this.showRpsModal = false;
    },

    // Tutku Odası Açılışı (Her girişte 1 kazıma hakkı yenilenir)
    openPassionDrawer(tab = 'wheel') {
      openPassionRoom();
      this.showGamesDrawer = true;
      this.activeGameTab = tab;
      this.scratchToast = null;
      if (!this.selectedPosition && store.kamasutraPositions?.length > 0) {
        this.selectedPosition = store.kamasutraPositions[0];
      }
      if (!this.selectedRoleplayCard && store.roleplayCards?.length > 0) {
        this.selectedRoleplayCard = store.roleplayCards[0];
      }
    },

    // 1. Kamasutra Pozisyon Çarkı Döndürme
    spinKamasutraWheel() {
      if (this.isSpinningWheel || !store.kamasutraPositions || store.kamasutraPositions.length === 0) return;
      this.isSpinningWheel = true;
      soundEngine.playBonk();

      const positions = store.kamasutraPositions;
      const count = positions.length;
      const randomIndex = Math.floor(Math.random() * count);
      const sliceDeg = 360 / count;
      const spins = (4 + Math.floor(Math.random() * 3)) * 360;
      // Çarkın hedef dilimini yukarıdaki oka getirecek dönüş açısı
      const targetAngle = spins + (360 - (randomIndex * sliceDeg) - (sliceDeg / 2));
      this.wheelRotation += targetAngle;

      setTimeout(() => {
        this.isSpinningWheel = false;
        this.selectedPosition = positions[randomIndex];
        soundEngine.playVictory();
      }, 2800);
    },

    // 2. Rol Yapma (Roleplay) Gizli Kart Çekme
    drawRoleplayCard() {
      if (this.isDrawingRoleplay || !store.roleplayCards || store.roleplayCards.length === 0) return;
      this.isDrawingRoleplay = true;
      soundEngine.playBonk();

      setTimeout(() => {
        const cards = store.roleplayCards;
        const currentId = this.selectedRoleplayCard?.id;
        const pool = cards.filter(c => c.id !== currentId);
        const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : cards[0];
        this.selectedRoleplayCard = chosen;
        this.isDrawingRoleplay = false;
        soundEngine.playVictory();
      }, 600);
    },

    // 3. Kazı Kazan (Giriş başına sadece 1 kart!)
    handleScratch(cardId) {
      const res = scratchCard(cardId);
      if (res.success) {
        soundEngine.playCoin();
        soundEngine.playVictory();
        this.scratchToast = '🎉 Harika! Sürpriz açıldı, keyfini çıkarın 💕';
        setTimeout(() => { this.scratchToast = null; }, 3500);
      } else if (res.alreadyUsed) {
        soundEngine.playBuzzer();
        this.scratchToast = res.error || 'Bu girişindeki 1 kazıma hakkını kullandın! Yeni bir sürpriz açmak için odaya tekrar gir.';
        setTimeout(() => { this.scratchToast = null; }, 4000);
      }
    },

    // 4. Tutku Zarları
    handleRollDice() {
      soundEngine.playDice();
      rollTutkuZarlari();
    },

    // Gece 12 (00:00) Geri Sayımı
    updateMidnightCountdown() {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight - now) / 1000));
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      this.midnightCountdownText = `${hours}:${minutes}:${seconds}`;
    },

    // Döngüsel Görev İlerlemesi
    getTaskProgressPercent(type) {
      const task = store.assignedTasks[type];
      if (!task || !task.targetCount) return 0;
      const count = task.currentCount || 0;
      return Math.min(Math.round((count / task.targetCount) * 100), 100);
    },
    incrementProgress(type, amount) {
      const res = updateTaskProgress(type, amount);
      if (res.success) {
        soundEngine.playSlap();
        if (res.isCompleted) {
          soundEngine.playVictory();
        }
      }
    },
    addCustomProgress(type) {
      const val = type === 'weekly' ? this.weeklyInputVal : this.monthlyInputVal;
      if (!val || val <= 0) return;
      const res = updateTaskProgress(type, val);
      if (res.success) {
        soundEngine.playSlap();
        if (type === 'weekly') this.weeklyInputVal = '';
        else this.monthlyInputVal = '';
        if (res.isCompleted) {
          soundEngine.playVictory();
        }
      }
    },
    claimTask(type) {
      const task = store.assignedTasks[type];
      if (!task) return;
      const pts = task.points;

      const success = completeTask(type);
      if (success) {
        soundEngine.playVictory();
        this.triggerPointsAnim(pts);
      }
    },
    triggerPointsAnim(amount) {
      this.pointsPopupAmount = amount;
      this.pointsPopup = true;
      this.pointsAnimating = true;

      setTimeout(() => {
        this.pointsPopup = false;
        this.pointsAnimating = false;
      }, 1500);
    }
  }
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-bottom: 74px; /* Alt navigasyon payı */
}

/* Üst Bar */
.home-top-bar {
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

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-heart {
  font-size: 1.1rem;
}

.brand-text {
  font-size: 0.8rem;
  color: var(--pink);
  font-weight: bold;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-pill {
  font-size: 0.6rem;
  transition: transform 0.2s ease;
}

.points-pop {
  transform: scale(1.15);
}

.admin-btn,
.logout-btn {
  padding: 6px 8px;
  font-size: 0.7rem;
}

/* Ana Kaydırma Akışı */
.home-main-scroll {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Karşılama Kartı */
.welcome-banner {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe3ea 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
}

.welcome-sub {
  font-size: 0.55rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.welcome-title {
  font-size: 0.72rem;
  color: var(--pixel-border);
  line-height: 1.4;
}

.welcome-emoji {
  font-size: 2.2rem;
}

/* Ring Hero Kartı */
.ring-hero-card {
  cursor: pointer;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  padding: 0;
  transition: transform 0.15s ease;
}

.ring-hero-card:active {
  transform: scale(0.98);
}

.ring-preview-bg {
  background: linear-gradient(180deg, #ffeef4 0%, #ffd6e4 100%);
  padding: 18px 14px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 3px solid var(--pixel-border);
  position: relative;
}

.preview-boyfriend {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.bf-avatar {
  font-size: 3.2rem;
}

.preview-custom-avatar {
  width: 105px;
  height: 105px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(2px 4px 0px rgba(50, 20, 40, 0.25));
}

.bf-tag {
  font-size: 0.5rem;
  background: #ffffff;
  border: 2px solid var(--pixel-border);
  box-shadow: 2px 2px 0 var(--pixel-shadow);
  padding: 2px 8px;
  border-radius: 8px;
  margin-top: 4px;
  color: var(--pink);
}

.weapon-preview-row {
  display: flex;
  gap: 12px;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 4px 12px;
  border-radius: 10px;
  border: 1px dashed var(--pink);
}

.ring-hero-info {
  padding: 12px 16px;
}

.ring-hero-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--pink);
  margin-bottom: 4px;
}

.hero-arrow {
  font-size: 1.1rem;
}

.ring-hero-desc {
  font-size: 0.55rem;
  color: var(--text-muted);
}

/* Puan Kazan Panel Tetikleyici Kartı */
.tasks-trigger-card {
  cursor: pointer;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  border-left: 6px solid var(--mint);
}

.tasks-trigger-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tasks-icon-box {
  width: 44px;
  height: 44px;
  background: var(--mint-light);
  border: 2px solid var(--pixel-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.tasks-info {
  flex: 1;
}

.tasks-title {
  font-size: 0.72rem;
  color: var(--pixel-border);
  margin-bottom: 2px;
}

.tasks-subtitle {
  font-size: 0.48rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.open-tasks-btn {
  font-size: 0.55rem;
  padding: 8px 10px;
  flex-shrink: 0;
}

/* Görev İlerleme Özeti */
.tasks-quick-preview {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px dashed #f0e6ed;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-task-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.5rem;
}

.preview-badge {
  font-size: 0.4rem;
  padding: 2px 6px;
  border: 1px solid var(--pixel-border);
  border-radius: 4px;
  font-weight: bold;
}

.preview-badge.daily {
  background: #ffe3ea;
  color: var(--pink);
}

.preview-badge.weekly {
  background: #e0f2fe;
  color: var(--sky);
}

.preview-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
}

.preview-pts,
.preview-progress {
  color: #f59f00;
  font-weight: bold;
}

/* Hızlı Erişim Kartları Izgarası */
.quick-links-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-card {
  cursor: pointer;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.quick-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.quick-card-icon {
  font-size: 1.5rem;
}

.quick-card-tag {
  font-size: 0.45rem;
  background: #f8e8ee;
  border: 1px solid var(--pixel-border);
  padding: 2px 4px;
  border-radius: 4px;
  color: var(--pink);
}

.quick-card-title {
  font-size: 0.7rem;
  color: var(--pixel-border);
  margin-bottom: 4px;
}

.quick-card-desc {
  font-size: 0.48rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 8px;
}

.quick-card-link {
  font-size: 0.5rem;
  color: var(--pink);
  font-weight: bold;
  align-self: flex-end;
}

/* Aşk Notu */
.love-note-card {
  background: #fffcf0;
  border-radius: 12px;
  padding: 14px;
  border-left: 6px solid var(--gold);
}

.note-pin {
  font-size: 1rem;
}

.note-quote {
  font-size: 0.55rem;
  font-style: italic;
  color: #7a6348;
  margin: 6px 0;
  line-height: 1.5;
}

.note-signature {
  font-size: 0.48rem;
  color: var(--pink);
  font-weight: bold;
  display: block;
  text-align: right;
}

/* ============================================
   AÇILIR PANEL STİLLERİ (DRAWER)
   ============================================ */
.drawer-tabs {
  display: flex;
  background: #fdf2f6;
  border-bottom: 2px solid var(--pixel-border);
}

.drawer-tab {
  flex: 1;
  padding: 12px 6px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-family: var(--font-pixel);
  font-size: 0.58rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.drawer-tab.active {
  color: var(--pink);
  background: #ffffff;
  border-bottom: 3px solid var(--pink);
  font-weight: bold;
}

.task-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.tab-notice {
  font-size: 0.5rem;
  color: var(--text-muted);
  background: #f8f0f5;
  padding: 8px;
  border-radius: 6px;
}

.task-active-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
}

.task-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.badge-type {
  font-size: 0.45rem;
  padding: 3px 6px;
  border: 1px solid var(--pixel-border);
  border-radius: 4px;
  font-weight: bold;
}

.badge-type.daily { background: #ffe3ea; color: var(--pink); }
.badge-type.weekly { background: #e0f2fe; color: var(--sky); }
.badge-type.monthly { background: #e6e0ff; color: var(--lavender); }
.badge-type.standard { background: #ffe4e6; color: #e11d48; }

.preview-badge.standard { background: #ffe4e6; color: #e11d48; }
.preview-standard-item {
  border-left: 3px solid #e11d48;
  background: #fff5f7 !important;
  cursor: pointer;
}

/* Standart Görev Kartları Stili */
.standard-notice {
  background: #fff1f2;
  border-left: 3px solid #f43f5e;
  color: #881337;
}

.standard-toast-banner {
  background: #dcfce7;
  border: 2px solid #86efac;
  color: #166534;
  font-size: 0.62rem;
  text-align: center;
  padding: 10px;
  font-weight: bold;
  border-radius: 8px;
}

.standard-task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.standard-task-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 14px;
  border: 2px solid var(--pixel-border);
}

.standard-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.standard-emoji {
  font-size: 1.8rem;
  line-height: 1;
}

.standard-name {
  font-size: 0.72rem;
  color: var(--pixel-border);
  margin: 0;
  line-height: 1.2;
}

.standard-desc {
  font-size: 0.5rem;
  color: var(--text-muted);
  margin-top: 3px;
  line-height: 1.3;
}

.standard-input-block {
  margin-top: 10px;
  background: #fff8fa;
  border: 2px dashed #f0b6cb;
  border-radius: 8px;
  padding: 10px;
}

.standard-calc-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.54rem;
  color: var(--pixel-border);
  margin-bottom: 8px;
}

.pts-calc-tag {
  font-weight: bold;
  color: #e11d48;
  font-size: 0.62rem;
}

.claim-standard-btn {
  flex: 1.4;
  font-size: 0.58rem;
  padding: 8px;
  white-space: nowrap;
}

.task-reward-pts {
  font-size: 0.65rem;
  color: #f59f00;
  font-weight: bold;
}

.task-main-title {
  font-size: 0.72rem;
  color: var(--pixel-border);
  margin-bottom: 8px;
  line-height: 1.4;
}

.task-hint {
  font-size: 0.5rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.claim-task-btn {
  width: 100%;
  font-size: 0.6rem;
  padding: 10px;
}

.ready-glow {
  background: #00c9a7;
  animation: glowPulse 1s infinite alternate;
}

@keyframes glowPulse {
  from { transform: scale(1); }
  to { transform: scale(1.02); box-shadow: 0 0 10px #00c9a7; }
}

/* Sayı Ekleme Alanı */
.counter-input-section {
  margin-top: 10px;
  background: #fff8fa;
  border: 2px dashed #f0b6cb;
  border-radius: 8px;
  padding: 10px;
}

.counter-label {
  font-size: 0.5rem;
  color: var(--pixel-border);
  margin-bottom: 6px;
}

.quick-add-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.quick-btn {
  flex: 1;
  font-size: 0.55rem;
  padding: 6px;
  background: #ffffff;
}

.custom-input-row {
  display: flex;
  gap: 8px;
}

.pixel-num-input {
  flex: 1;
  font-family: var(--font-pixel);
  font-size: 0.6rem;
  padding: 8px;
  border: 2px solid var(--pixel-border);
  border-radius: 6px;
  outline: none;
}

.pixel-num-input:focus {
  border-color: var(--pink);
}

.celebrate-badge {
  font-size: 0.65rem;
  color: #00b894;
  text-align: center;
  margin: 10px 0;
  font-weight: bold;
}

.empty-task-card {
  text-align: center;
  padding: 20px;
  font-size: 0.55rem;
  color: var(--text-muted);
}

/* Bonus Puan Bölümü */
.bonus-point-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
}

.bonus-title {
  font-size: 0.62rem;
  color: var(--pixel-border);
  margin-bottom: 8px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.5rem;
  padding: 6px 0;
  border-bottom: 1px solid #f5edf1;
}

.bonus-item:last-child {
  border-bottom: none;
}

.bonus-emoji {
  font-size: 1rem;
}

.bonus-desc {
  flex: 1;
  color: var(--text-main);
}

.bonus-pts {
  color: #f59f00;
  font-weight: bold;
}

/* Uçan Ödül Bildirimi */
.points-reward-popup {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #f59f00;
  color: #ffffff;
  border: 3px solid var(--pixel-border);
  box-shadow: 4px 4px 0 var(--pixel-shadow);
  padding: 10px 18px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 12px;
  z-index: 2000;
  animation: popDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popDown {
  from { transform: translate(-50%, -20px) scale(0.8); opacity: 0; }
  to { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

/* ========================================================
   YENİ EKLENEN ÖZELLİKLER CSS STİLLERİ
   ======================================================== */

/* 1. Ceza Bildirim Modalı */
.penalty-alert-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.penalty-alert-modal {
  background: #ffffff;
  border: 4px solid #ff4757;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(255, 71, 87, 0.4);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.penalty-skull-icon {
  font-size: 2.8rem;
  margin-bottom: 8px;
}

.penalty-alert-title {
  font-size: 0.85rem;
  color: #ff4757;
  margin-bottom: 8px;
  font-weight: bold;
}

.penalty-alert-msg {
  font-size: 0.6rem;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 12px;
}

.penalty-pts-badge {
  background: #ffe3e8;
  color: #ff4757;
  border: 2px dashed #ff4757;
  padding: 8px 14px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 16px;
  display: inline-block;
}

.penalty-ack-btn {
  width: 100%;
  font-size: 0.65rem;
  padding: 10px;
  background: #ff4757;
}

/* 2. Zorunlu Günlük Cinsel Görev Kartı */
.intimate-hero-card {
  background: linear-gradient(135deg, #fff0f3 0%, #ffd6e0 100%);
  border: 3px solid #ff4d6d;
  box-shadow: 4px 4px 0 #c9184a;
  border-radius: 14px;
  padding: 14px;
}

.intimate-card-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.55rem;
  font-weight: bold;
  color: #c9184a;
  margin-bottom: 10px;
}

.intimate-timer-tag {
  background: #c9184a;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.5rem;
}

.intimate-title {
  font-size: 0.75rem;
  color: #590d22;
  margin-bottom: 6px;
}

.intimate-sub {
  font-size: 0.55rem;
  color: #800f2f;
  margin-bottom: 10px;
}

.intimate-penalty-box {
  background: rgba(255, 255, 255, 0.8);
  border-left: 4px solid #ff4757;
  padding: 8px 10px;
  border-radius: 6px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.intimate-penalty-box .warning-icon {
  font-size: 0.9rem;
}

.intimate-penalty-box .warning-text {
  font-size: 0.52rem;
  color: #590d22;
  line-height: 1.4;
}

.intimate-penalty-box .warning-text em {
  display: block;
  color: #ff4757;
  margin-top: 2px;
}

.intimate-success-banner {
  background: #00b894;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.58rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.intimate-done-badge {
  background: #e6fcf5;
  color: #0ca678;
  border: 2px solid #0ca678;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.62rem;
  font-weight: bold;
  text-align: center;
  width: 100%;
}

.claim-intimate-btn {
  width: 100%;
  font-size: 0.65rem;
  padding: 10px;
  background: #ff4d6d;
  color: #ffffff;
  border: 2px solid #590d22;
}

/* 3. Taş - Kağıt - Makas Hero Kartı */
.rps-hero-card {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border: 3px solid #7c3aed;
  box-shadow: 4px 4px 0 #5b21b6;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.rps-hero-card:active {
  transform: translateY(2px);
}

.rps-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rps-icon-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 1.2rem;
  background: #ffffff;
  padding: 6px 8px;
  border-radius: 10px;
  border: 2px solid #7c3aed;
}

.rps-text-block {
  flex: 1;
}

.rps-badge {
  font-size: 0.5rem;
  color: #6d28d9;
  font-weight: bold;
  margin-bottom: 3px;
}

.rps-title {
  font-size: 0.72rem;
  color: #4c1d95;
  margin-bottom: 4px;
}

.rps-desc {
  font-size: 0.52rem;
  color: #5b21b6;
  line-height: 1.35;
}

.rps-play-btn {
  padding: 8px 12px;
  font-size: 0.62rem;
  background: #7c3aed;
  white-space: nowrap;
}

/* 4. Günün Fantezisi Kartı */
.fantasy-hero-card {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 3px solid #ea580c;
  box-shadow: 4px 4px 0 #9a3412;
  border-radius: 14px;
  padding: 14px;
}

.fantasy-card-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.55rem;
  font-weight: bold;
  color: #ea580c;
  margin-bottom: 10px;
}

.fantasy-day-tag {
  background: #ea580c;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.5rem;
}

.fantasy-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.fantasy-emoji {
  font-size: 1.4rem;
}

.fantasy-title {
  font-size: 0.72rem;
  color: #7c2d12;
}

.fantasy-desc {
  font-size: 0.55rem;
  color: #9a3412;
  line-height: 1.4;
  margin-bottom: 8px;
}

.fantasy-privacy-note {
  font-size: 0.48rem;
  color: #b45309;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.fantasy-match-banner {
  background: #ea580c;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.58rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  animation: popDown 0.3s ease;
}

.fantasy-vote-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

.fantasy-btn {
  padding: 8px 4px;
  font-size: 0.52rem;
  border: 2px solid var(--pixel-border);
}

.fantasy-btn.love {
  background: #ff4757;
  color: #ffffff;
}

.fantasy-btn.maybe {
  background: #ffa502;
  color: #ffffff;
}

.fantasy-btn.pass {
  background: #f1f2f6;
  color: #747d8c;
}

.fantasy-voted-box {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  border: 2px dashed #ea580c;
}

.my-vote-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.55rem;
  margin-bottom: 6px;
}

.vote-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.5rem;
}

.vote-tag.love { background: #ff4757; color: #fff; }
.vote-tag.maybe { background: #ffa502; color: #fff; }
.vote-tag.pass { background: #ced6e0; color: #333; }

.fantasy-matched-pill {
  background: #e6fcf5;
  color: #0ca678;
  border: 2px solid #0ca678;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.54rem;
  font-weight: bold;
  text-align: center;
}

.waiting-partner-note {
  font-size: 0.5rem;
  color: #b45309;
  text-align: center;
  font-style: italic;
}

/* 5. Tutku Odası (Oyunlar) Kartı */
.passion-hero-card {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 3px solid #059669;
  box-shadow: 4px 4px 0 #064e3b;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
}

.passion-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passion-icon-box {
  font-size: 1.8rem;
  background: #ffffff;
  padding: 8px;
  border-radius: 10px;
  border: 2px solid #059669;
}

.passion-text {
  flex: 1;
}

.passion-badge {
  font-size: 0.48rem;
  color: #047857;
  font-weight: bold;
}

.passion-title {
  font-size: 0.68rem;
  color: #064e3b;
  margin: 2px 0 4px 0;
}

.passion-desc {
  font-size: 0.5rem;
  color: #047857;
  line-height: 1.35;
}

.passion-btn {
  padding: 8px 12px;
  font-size: 0.62rem;
  white-space: nowrap;
}

/* 6. RPS Modal İçi Tasarımlar */
.rps-modal-box {
  background: #ffffff;
  border-radius: 16px;
  max-width: 380px;
  width: 92%;
  border: 4px solid var(--pixel-border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  padding: 16px;
  max-height: 90vh;
  overflow-y: auto;
}

.rps-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.rps-modal-title {
  font-size: 0.8rem;
  color: var(--pixel-border);
}

.rps-phase-box {
  text-align: center;
}

.rps-player-badge {
  display: inline-block;
  background: #ff4d6d;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.55rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.rps-player-badge.player-2 {
  background: #7c3aed;
}

.rps-phase-prompt {
  font-size: 0.58rem;
  color: var(--text-main);
  margin-bottom: 16px;
}

.rps-choices-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.rps-choice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px;
  font-size: 0.6rem;
  border: 2px solid var(--pixel-border);
}

.rc-emoji {
  font-size: 1.8rem;
}

.rc-label {
  font-size: 0.55rem;
  font-weight: bold;
}

.rps-versus-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 16px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid #eee;
}

.rps-player-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rps-player-result .player-name {
  font-size: 0.52rem;
  color: var(--text-muted);
}

.rps-player-result .choice-big {
  font-size: 1.2rem;
  font-weight: bold;
}

.vs-text {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff4757;
}

.winner-banner {
  background: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.62rem;
  margin-bottom: 6px;
}

.loser-banner {
  background: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.62rem;
  margin-bottom: 14px;
}

.rps-countdown-block {
  background: #fff3cd;
  border: 3px solid #ffc107;
  border-radius: 12px;
  padding: 14px;
  margin-top: 10px;
}

.countdown-warning-badge {
  font-size: 0.6rem;
  font-weight: bold;
  color: #856404;
  margin-bottom: 6px;
}

.countdown-clock-pulse {
  font-size: 2.2rem;
  font-weight: bold;
  color: #dc3545;
  animation: heartPulse 1s infinite alternate;
  margin-bottom: 6px;
}

.countdown-instruction {
  font-size: 0.52rem;
  color: #856404;
  line-height: 1.4;
  margin-bottom: 12px;
}

.confirm-decision-btn {
  width: 100%;
  font-size: 0.68rem;
  padding: 12px;
  background: #28a745;
  color: #ffffff;
  border: 2px solid #1e7e34;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.decided-badge {
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.decided-desc {
  font-size: 0.55rem;
  color: var(--text-main);
}

.penalized-badge {
  background: #dc3545;
  color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.penalized-pts {
  font-size: 0.85rem;
  font-weight: bold;
  color: #dc3545;
  margin-bottom: 6px;
}

.penalized-desc {
  font-size: 0.55rem;
  color: var(--text-main);
}

/* 7. Tutku Zarları & Kazı Kazan Tasarımları */
.dice-arena {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.dice-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.die-card {
  background: #fdf2f8;
  border: 2px solid #f472b6;
  border-radius: 10px;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.die-label {
  font-size: 0.45rem;
  font-weight: bold;
  color: #db2777;
}

.die-val {
  font-size: 0.65rem;
  font-weight: bold;
  color: #831843;
}

.roll-dice-btn {
  width: 100%;
  padding: 12px;
  font-size: 0.72rem;
  background: #ec4899;
}

.scratch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.scratch-card {
  min-height: 110px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid var(--pixel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  padding: 10px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.scratch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.15);
}

.scratch-card.disabled-scratch {
  opacity: 0.6;
  cursor: not-allowed;
}

.scratch-foil {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  width: 100%;
  height: 100%;
  justify-content: center;
  border-radius: 8px;
  padding: 12px;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
}

.foil-icon {
  font-size: 1.4rem;
}

.foil-hint {
  font-size: 0.48rem;
  font-weight: bold;
  color: #1e293b;
}

.scratch-revealed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: popDown 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.revealed-emoji {
  font-size: 1.4rem;
}

.scratched-tag {
  font-size: 0.44rem;
  background: #ff4757;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.revealed-title {
  font-size: 0.62rem;
  font-weight: bold;
  color: var(--pixel-border);
}

.revealed-desc {
  font-size: 0.5rem;
  color: var(--text-main);
  line-height: 1.35;
}

.scratch-status-banner {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.58rem;
  line-height: 1.4;
  margin-bottom: 12px;
  text-align: center;
}

.scratch-status-banner.ready {
  background: #e6fcf5;
  border: 2px solid #20c997;
  color: #087f5b;
}

.scratch-status-banner.used {
  background: #fff3bf;
  border: 2px solid #fab005;
  color: #f08c00;
}

.scratch-toast-alert {
  background: #ff4757;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.55rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
}

/* ============================================================
   KAMASUTRA ÇARKI VE ROL YAPMA TASARIMLARI
   ============================================================ */
.passion-drawer-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.passion-drawer-tabs .drawer-tab {
  font-size: 0.48rem;
  padding: 8px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 8px;
}

/* Çark Tasarımı */
.wheel-stage-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid var(--pixel-border);
  margin-bottom: 14px;
}

.wheel-viewport {
  position: relative;
  width: 210px;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.wheel-pointer {
  position: absolute;
  top: -8px;
  font-size: 1.5rem;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  animation: pointerBob 1s infinite alternate ease-in-out;
}

@keyframes pointerBob {
  from { transform: translateY(0); }
  to { transform: translateY(3px); }
}

.kamasutra-wheel {
  position: relative;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  border: 4px solid #ff4757;
  background: conic-gradient(
    #ffeedd 0deg 45deg,
    #ffe3e3 45deg 90deg,
    #ffeedd 90deg 135deg,
    #ffe3e3 135deg 180deg,
    #ffeedd 180deg 225deg,
    #ffe3e3 225deg 270deg,
    #ffeedd 270deg 315deg,
    #ffe3e3 315deg 360deg
  );
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.25), inset 0 0 10px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wheel-slice {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  pointer-events: none;
}

.slice-emoji {
  font-size: 1rem;
}

.slice-label {
  font-size: 0.4rem;
  font-weight: bold;
  color: #c92a2a;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wheel-center-hub {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #ff4757;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 5;
}

.spin-wheel-btn {
  width: 100%;
  max-width: 240px;
  padding: 12px;
  font-size: 0.68rem;
  background: #ff4757;
}

/* Pozisyon Detay Kartı */
.position-detail-card {
  background: #fff0f3;
  border: 2px solid #ff758f;
  border-radius: 14px;
  padding: 14px;
  animation: popDown 0.3s ease;
}

.pos-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  border-bottom: 1px dashed #ffb3c1;
  padding-bottom: 8px;
}

.pos-big-emoji {
  font-size: 2.2rem;
  background: #fff;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid #ffccd5;
}

.pos-title {
  font-size: 0.75rem;
  color: #590d22;
  margin-bottom: 4px;
}

.pos-meta-tags {
  display: flex;
  gap: 6px;
}

.pos-badge {
  font-size: 0.45rem;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: bold;
}

.pos-cat {
  background: #ffccd5;
  color: #800f2f;
}

.pos-diff {
  background: #ffe3e3;
  color: #c92a2a;
}

.pos-desc-text {
  font-size: 0.58rem;
  color: #333333;
  line-height: 1.45;
  margin-bottom: 8px;
}

.pos-tip-box {
  background: #ffffff;
  border-left: 3px solid #ff4757;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.52rem;
  color: #590d22;
  line-height: 1.4;
}

/* Rol Yapma (Roleplay) Tasarımı */
.roleplay-deck-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid var(--pixel-border);
  margin-bottom: 14px;
}

.deck-visual-stack {
  position: relative;
  width: 150px;
  height: 90px;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.deck-visual-stack.animating {
  animation: cardShuffle 0.6s infinite alternate;
}

@keyframes cardShuffle {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(-3deg); }
  100% { transform: scale(1) rotate(3deg); }
}

.deck-shadow-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f1f3f5;
  border: 2px solid #ced4da;
  border-radius: 10px;
  top: 6px;
  left: 6px;
  z-index: 1;
}

.deck-shadow-card.card-2 {
  top: 3px;
  left: 3px;
  background: #e9ecef;
  z-index: 2;
}

.deck-top-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  border: 2px solid #818cf8;
  border-radius: 10px;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(49, 46, 129, 0.3);
}

.deck-icon {
  font-size: 1.6rem;
}

.deck-title {
  font-size: 0.44rem;
  letter-spacing: 0.5px;
  font-weight: bold;
  color: #e0e7ff;
}

.draw-scenario-btn {
  width: 100%;
  max-width: 240px;
  padding: 12px;
  font-size: 0.68rem;
  background: #4f46e5;
  color: #fff;
}

.roleplay-result-card {
  background: #f5f3ff;
  border: 2px solid #c4b5fd;
  border-radius: 14px;
  padding: 14px;
  animation: popDown 0.3s ease;
}

.rp-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  border-bottom: 1px dashed #ddd6fe;
  padding-bottom: 10px;
}

.rp-emoji {
  font-size: 2.2rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 6px;
  border: 1px solid #ddd6fe;
}

.rp-title {
  font-size: 0.76rem;
  color: #3b0764;
  margin-bottom: 4px;
}

.rp-setting-pill {
  font-size: 0.5rem;
  background: #ede9fe;
  color: #6b21a8;
  padding: 3px 8px;
  border-radius: 8px;
  display: inline-block;
  font-weight: bold;
}

.rp-roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.rp-role-box {
  background: #ffffff;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid #e9d5ff;
}

.role-who {
  font-size: 0.46rem;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

.rp-role-box.partner-1 .role-who {
  color: #7c3aed;
}

.rp-role-box.partner-2 .role-who {
  color: #db2777;
}

.role-what {
  font-size: 0.52rem;
  color: #374151;
  line-height: 1.35;
}

.rp-rules-box {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.rules-label {
  font-size: 0.48rem;
  font-weight: bold;
  color: #b45309;
  display: block;
  margin-bottom: 2px;
}

.rules-text {
  font-size: 0.52rem;
  color: #78350f;
  line-height: 1.35;
}

.rp-desc-box {
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #f3e8ff;
  margin-bottom: 12px;
}

.desc-label {
  font-size: 0.48rem;
  font-weight: bold;
  color: #6b21a8;
  display: block;
  margin-bottom: 2px;
}

.desc-text {
  font-size: 0.52rem;
  color: #4b5563;
  line-height: 1.4;
}

.rp-card-footer {
  text-align: center;
}

/* 8. Görev Kilit & Ceza Uyarıları */
.daily-locked-card {
  text-align: center;
  padding: 20px 14px;
  background: #f1f3f5;
  border: 2px dashed #adb5bd;
  border-radius: 12px;
}

.locked-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.locked-title {
  font-size: 0.72rem;
  color: #495057;
  margin-bottom: 6px;
}

.locked-desc {
  font-size: 0.55rem;
  color: #868e96;
  line-height: 1.4;
  margin-bottom: 14px;
}

.locked-timer-badge {
  background: #212529;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.timer-label {
  font-size: 0.46rem;
  color: #adb5bd;
}

.timer-countdown {
  font-size: 0.8rem;
  font-weight: bold;
  color: #ffd43b;
}

.task-penalty-warning {
  background: #fff5f5;
  border-left: 3px solid #ff6b6b;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.5rem;
  color: #c92a2a;
  margin-bottom: 10px;
  line-height: 1.35;
}
</style>
